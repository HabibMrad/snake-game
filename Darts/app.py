import socketio
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import secrets
import time
from typing import Dict, Optional
from datetime import datetime, timedelta

# Create FastAPI app
app = FastAPI()

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    ping_timeout=60,
    ping_interval=25
)

# Wrap with ASGI app
socket_app = socketio.ASGIApp(sio, app)

# In-memory storage for games
games: Dict[str, dict] = {}
player_connections: Dict[str, dict] = {}

# Game constants
STARTING_SCORE = 501
DARTS_PER_TURN = 3
TURN_TIME_SECONDS = 30


class GameState:
    def __init__(self, game_id: str):
        self.game_id = game_id
        self.players = {}
        self.scores = {}
        self.current_turn = 0
        self.turn_start_time = None
        self.turn_darts_thrown = 0
        self.game_started = False
        self.game_over = False
        self.winner = None
        self.history = []
        self.created_at = datetime.now()

    def add_player(self, player_id: str, player_name: str) -> bool:
        if len(self.players) >= 2:
            return False
        if player_id not in self.players:
            self.players[player_id] = {
                'id': player_id,
                'name': player_name,
                'connected': True
            }
            self.scores[player_id] = STARTING_SCORE
            return True
        return False

    def start_game(self):
        if len(self.players) == 2 and not self.game_started:
            self.game_started = True
            self.turn_start_time = time.time()
            return True
        return False

    def get_current_player(self) -> Optional[str]:
        if not self.players:
            return None
        player_ids = list(self.players.keys())
        return player_ids[self.current_turn % len(player_ids)]

    def process_dart(self, player_id: str, score: int, multiplier: int) -> dict:
        if self.game_over:
            return {'success': False, 'error': 'Game is over'}

        if self.get_current_player() != player_id:
            return {'success': False, 'error': 'Not your turn'}

        if self.turn_darts_thrown >= DARTS_PER_TURN:
            return {'success': False, 'error': 'Turn is over'}

        # Calculate dart value
        dart_value = score * multiplier
        current_score = self.scores[player_id]
        new_score = current_score - dart_value

        # Validate dart throw
        if score < 0 or score > 20 and score != 25:
            return {'success': False, 'error': 'Invalid score'}

        if multiplier not in [1, 2, 3]:
            return {'success': False, 'error': 'Invalid multiplier'}

        # Handle bullseye multipliers
        if score == 25 and multiplier == 3:
            return {'success': False, 'error': 'No triple bullseye'}

        # Record the throw
        self.turn_darts_thrown += 1

        throw_info = {
            'player_id': player_id,
            'player_name': self.players[player_id]['name'],
            'score': score,
            'multiplier': multiplier,
            'value': dart_value,
            'dart_number': self.turn_darts_thrown,
            'timestamp': datetime.now().isoformat()
        }

        # Check for bust (going below 0 or landing on 1)
        bust = False
        if new_score < 0 or new_score == 1:
            bust = True
            throw_info['bust'] = True
            throw_info['result'] = 'Bust! Score returns to ' + str(current_score)
        elif new_score == 0:
            # Win condition - must finish on a double
            if multiplier == 2:
                self.scores[player_id] = 0
                self.game_over = True
                self.winner = player_id
                throw_info['result'] = 'Winner!'
            else:
                bust = True
                throw_info['bust'] = True
                throw_info['result'] = 'Must finish on a double!'
        else:
            self.scores[player_id] = new_score
            throw_info['new_score'] = new_score

        self.history.append(throw_info)

        # Check if turn is over
        turn_over = self.turn_darts_thrown >= DARTS_PER_TURN or self.game_over

        if turn_over and not self.game_over:
            # If busted, revert score
            if bust:
                self.scores[player_id] = current_score
            self.next_turn()

        return {
            'success': True,
            'throw': throw_info,
            'scores': self.scores,
            'turn_over': turn_over,
            'game_over': self.game_over,
            'winner': self.winner,
            'current_player': self.get_current_player()
        }

    def next_turn(self):
        self.current_turn += 1
        self.turn_darts_thrown = 0
        self.turn_start_time = time.time()

    def get_time_remaining(self) -> int:
        if not self.turn_start_time:
            return TURN_TIME_SECONDS
        elapsed = time.time() - self.turn_start_time
        remaining = TURN_TIME_SECONDS - int(elapsed)
        return max(0, remaining)

    def handle_timeout(self):
        if not self.game_over:
            self.history.append({
                'player_id': self.get_current_player(),
                'player_name': self.players[self.get_current_player()]['name'],
                'result': 'Turn timed out',
                'timestamp': datetime.now().isoformat()
            })
            self.next_turn()

    def to_dict(self) -> dict:
        return {
            'game_id': self.game_id,
            'players': self.players,
            'scores': self.scores,
            'current_turn': self.current_turn,
            'current_player': self.get_current_player(),
            'time_remaining': self.get_time_remaining(),
            'turn_darts_thrown': self.turn_darts_thrown,
            'game_started': self.game_started,
            'game_over': self.game_over,
            'winner': self.winner,
            'history': self.history[-20:]  # Last 20 throws
        }


def generate_game_id() -> str:
    return secrets.token_urlsafe(8)


def get_game(game_id: str) -> Optional[GameState]:
    return games.get(game_id)


def cleanup_old_games():
    """Remove games older than 2 hours"""
    cutoff = datetime.now() - timedelta(hours=2)
    to_remove = [
        game_id for game_id, game in games.items()
        if game.created_at < cutoff
    ]
    for game_id in to_remove:
        del games[game_id]


# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

    # Mark player as disconnected
    if sid in player_connections:
        conn_info = player_connections[sid]
        game_id = conn_info.get('game_id')
        player_id = conn_info.get('player_id')

        if game_id and player_id:
            game = get_game(game_id)
            if game and player_id in game.players:
                game.players[player_id]['connected'] = False
                await sio.emit('player_disconnected', {
                    'player_id': player_id,
                    'player_name': game.players[player_id]['name']
                }, room=game_id)

        del player_connections[sid]


@sio.event
async def create_game(sid, data):
    try:
        player_name = data.get('player_name', 'Player 1')

        # Cleanup old games
        cleanup_old_games()

        # Create new game
        game_id = generate_game_id()
        game = GameState(game_id)

        # Add creator as first player
        player_id = sid
        game.add_player(player_id, player_name)
        games[game_id] = game

        # Track connection
        player_connections[sid] = {
            'game_id': game_id,
            'player_id': player_id
        }

        # Join Socket.IO room
        await sio.enter_room(sid, game_id)

        await sio.emit('game_created', {
            'game_id': game_id,
            'player_id': player_id,
            'game_state': game.to_dict()
        }, room=sid)

        print(f"Game created: {game_id}")

    except Exception as e:
        await sio.emit('error', {'message': str(e)}, room=sid)


@sio.event
async def join_game(sid, data):
    try:
        game_id = data.get('game_id')
        player_name = data.get('player_name', 'Player 2')

        game = get_game(game_id)
        if not game:
            await sio.emit('error', {'message': 'Game not found'}, room=sid)
            return

        # Check if player is rejoining
        player_id = sid
        existing_player = None
        for pid, player in game.players.items():
            if player['name'] == player_name:
                existing_player = pid
                break

        if existing_player:
            # Reconnecting player
            player_id = existing_player
            game.players[player_id]['connected'] = True
        else:
            # New player
            if not game.add_player(player_id, player_name):
                await sio.emit('error', {'message': 'Game is full'}, room=sid)
                return

        # Track connection
        player_connections[sid] = {
            'game_id': game_id,
            'player_id': player_id
        }

        # Join Socket.IO room
        await sio.enter_room(sid, game_id)

        # Notify player
        await sio.emit('game_joined', {
            'game_id': game_id,
            'player_id': player_id,
            'game_state': game.to_dict()
        }, room=sid)

        # Notify other players
        await sio.emit('player_joined', {
            'player_id': player_id,
            'player_name': player_name,
            'game_state': game.to_dict()
        }, room=game_id, skip_sid=sid)

        # Start game if both players are present
        if len(game.players) == 2 and not game.game_started:
            game.start_game()
            await sio.emit('game_started', {
                'game_state': game.to_dict()
            }, room=game_id)

        print(f"Player joined game {game_id}: {player_name}")

    except Exception as e:
        await sio.emit('error', {'message': str(e)}, room=sid)


@sio.event
async def throw_dart(sid, data):
    try:
        game_id = data.get('game_id')
        score = data.get('score')
        multiplier = data.get('multiplier')

        game = get_game(game_id)
        if not game:
            await sio.emit('error', {'message': 'Game not found'}, room=sid)
            return

        if sid not in player_connections:
            await sio.emit('error', {'message': 'Player not in game'}, room=sid)
            return

        player_id = player_connections[sid]['player_id']

        # Process the dart throw
        result = game.process_dart(player_id, score, multiplier)

        if not result['success']:
            await sio.emit('error', {'message': result.get('error')}, room=sid)
            return

        # Broadcast the throw result to all players in the game
        await sio.emit('dart_thrown', {
            'throw': result['throw'],
            'scores': result['scores'],
            'turn_over': result['turn_over'],
            'game_over': result['game_over'],
            'winner': result['winner'],
            'current_player': result['current_player'],
            'game_state': game.to_dict()
        }, room=game_id)

        print(f"Dart thrown in game {game_id}: {score}x{multiplier}")

    except Exception as e:
        await sio.emit('error', {'message': str(e)}, room=sid)


@sio.event
async def get_game_state(sid, data):
    try:
        game_id = data.get('game_id')
        game = get_game(game_id)

        if not game:
            await sio.emit('error', {'message': 'Game not found'}, room=sid)
            return

        await sio.emit('game_state_update', {
            'game_state': game.to_dict()
        }, room=sid)

    except Exception as e:
        await sio.emit('error', {'message': str(e)}, room=sid)


@sio.event
async def heartbeat(sid, data):
    await sio.emit('heartbeat_ack', {}, room=sid)


# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")


# Routes
@app.get("/", response_class=HTMLResponse)
async def index():
    html_path = Path("static/index.html")
    if html_path.exists():
        return HTMLResponse(content=html_path.read_text())
    return HTMLResponse(content="<h1>Darts Game - File not found</h1>")


@app.get("/game/{game_id}", response_class=HTMLResponse)
async def game_page(game_id: str):
    html_path = Path("static/game.html")
    if html_path.exists():
        return HTMLResponse(content=html_path.read_text())
    return HTMLResponse(content="<h1>Darts Game - File not found</h1>")


if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=8000, log_level="info")
