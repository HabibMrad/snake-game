# Real-Time Multiplayer Darts Game

A fully-featured online multiplayer darts game built with Python (FastAPI + Socket.IO) and vanilla JavaScript. Play 501 darts with a friend in real-time with WebSocket synchronization.

## Features

### Game Mechanics
- **Standard 501 Scoring**: Start at 501 and count down to exactly 0
- **Turn-Based Gameplay**: 3 darts per turn, alternating between players
- **Proper Darts Rules**:
  - Must finish on a double to win
  - Bust rule: going below 0 or landing on 1 returns score to start of turn
  - Standard dartboard layout with singles, doubles, and triples
- **30-Second Turn Timer**: Automatic turn skip if time expires

### Real-Time Features
- **WebSocket Connections**: Instant updates between players using Socket.IO
- **Live Score Updates**: Both players see throws and scores in real-time
- **Connection Status**: Visual indicators for player connection state
- **Reconnection Support**: Players can rejoin ongoing games
- **Heartbeat System**: Automatic detection of disconnected players

### User Interface
- **Interactive Dartboard**: HTML5 Canvas with clickable zones
  - Bullseye (50 points - double bull, 25 points - single bull)
  - Triple ring (3x score)
  - Double ring (2x score)
  - Single segments (1-20)
- **Live Scoreboard**: Real-time score display for both players
- **Game History**: Shows recent throws with detailed information
- **Visual Feedback**: Click animations and throw results
- **Responsive Design**: Works on desktop and mobile devices

### Session Management
- **Unique Game Links**: Shareable URLs for easy joining (e.g., `/game/abc123`)
- **Game Codes**: Short codes for manual game joining
- **Waiting Room**: Hold area until both players join
- **Play Again**: Create new game after completion

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Socket.IO**: Real-time bidirectional communication
- **Uvicorn**: ASGI server with WebSocket support
- **In-Memory Storage**: Fast game state management

### Frontend
- **HTML5 Canvas**: High-performance dartboard rendering
- **Socket.IO Client**: Real-time WebSocket connection
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern responsive design

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Setup Steps

1. **Clone or navigate to the project directory**:
   ```bash
   cd Darts
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Mac/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Game

1. **Start the server**:
   ```bash
   python app.py
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

3. **Testing with two players**:
   - Open the game in one browser window (Player 1)
   - Click "Create New Game" and enter your name
   - Copy the game link that appears
   - Open a new browser window (or incognito window for same computer)
   - Paste the game link or click "Join Existing Game" and enter the code
   - Both players will be connected and the game will start!

## How to Play

### Starting a Game

1. **Create a Game**:
   - Enter your name
   - Click "Create New Game"
   - Share the generated link or code with your opponent

2. **Join a Game**:
   - Get the game link or code from your opponent
   - Enter your name
   - Click "Join Game" or use the shared link

### Playing

1. **Click on the dartboard** to throw a dart
2. **Scoring zones**:
   - Center bullseye (red) = 50 points (double)
   - Outer bull (green) = 25 points
   - Triple ring (inner colored ring) = 3x the segment number
   - Double ring (outer colored ring) = 2x the segment number
   - Single areas = face value of segment number

3. **Winning**:
   - Reduce your score to exactly 0
   - Must finish on a double (double ring or double bullseye)
   - If you go below 0 or land on 1, you "bust" and your turn ends

4. **Time Limit**:
   - Each turn has a 30-second timer
   - If time runs out, your turn is skipped

### Game Controls

- **Leave Game**: Exit the current game and return to lobby
- **Play Again**: Start a new game after completion (returns to lobby)

## Architecture

### Backend Architecture

#### Game State Management
- `GameState` class handles all game logic
- In-memory dictionary stores active games
- Automatic cleanup of games older than 2 hours
- Server-side validation of all moves

#### WebSocket Events

**Client → Server**:
- `create_game`: Create a new game session
- `join_game`: Join an existing game
- `throw_dart`: Submit a dart throw
- `get_game_state`: Request current game state
- `heartbeat`: Keep-alive signal

**Server → Client**:
- `game_created`: Confirmation with game ID
- `game_joined`: Join confirmation with state
- `player_joined`: Notify other players
- `game_started`: Game begins
- `dart_thrown`: Broadcast throw result
- `player_disconnected`: Player connection lost
- `game_state_update`: Sync game state
- `error`: Error messages

#### Security Features
- Server-side move validation
- Turn enforcement (can't throw out of turn)
- Input sanitization for player names
- Rate limiting via Socket.IO timeout settings

### Frontend Architecture

#### Dartboard Rendering (`dartboard.js`)
- `Dartboard` class handles Canvas drawing
- Precise geometric calculations for hit detection
- 20 segments in standard dartboard arrangement
- Color-coded zones (red/white/black/green)

#### Game Logic (`game.js`)
- WebSocket event handlers
- UI state management
- Real-time updates
- Timer synchronization
- Reconnection handling

#### Lobby (`app.js`)
- Game creation and joining
- Link sharing functionality
- Waiting room management

## File Structure

```
Darts/
├── app.py                  # Backend server (FastAPI + Socket.IO)
├── requirements.txt        # Python dependencies
├── .gitignore             # Git ignore file
├── README.md              # This file
└── static/
    ├── index.html         # Lobby page
    ├── game.html          # Game page
    ├── style.css          # Styles for all pages
    ├── app.js             # Lobby JavaScript
    ├── game.js            # Game logic JavaScript
    └── dartboard.js       # Dartboard rendering and interaction
```

## Development

### Adding Features

1. **Backend changes**: Modify `app.py`
   - Add new Socket.IO events in event handlers
   - Update `GameState` class for new game logic

2. **Frontend changes**: Modify JavaScript files
   - `dartboard.js`: Dartboard rendering and hit detection
   - `game.js`: Game UI and WebSocket handlers
   - `app.js`: Lobby functionality

3. **Styling**: Update `style.css`

### Testing

1. **Local testing**: Open multiple browser windows/tabs
2. **Network testing**: Use local network IP instead of localhost
3. **Incognito mode**: Test with different user sessions

### Debugging

- **Server logs**: Check terminal for Socket.IO events
- **Browser console**: Check for JavaScript errors and WebSocket messages
- **Network tab**: Monitor WebSocket frames and HTTP requests

## Deployment

### Local Network
```bash
# Run on all network interfaces
python app.py
# Access via http://<your-local-ip>:8000
```

### Production Deployment

For production deployment, consider:

1. **Use Redis** for session storage (currently in-memory)
2. **Add authentication** for player verification
3. **Use environment variables** for configuration
4. **Add HTTPS** with SSL certificates
5. **Use a production ASGI server** like Gunicorn with Uvicorn workers
6. **Deploy to cloud** (Heroku, AWS, DigitalOcean, etc.)

Example production command:
```bash
gunicorn app:socket_app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Troubleshooting

### Connection Issues
- **Problem**: Can't connect to server
- **Solution**: Check if server is running on correct port, check firewall settings

### WebSocket Errors
- **Problem**: WebSocket connection fails
- **Solution**: Ensure `python-socketio` and `aiohttp` are installed, try polling fallback

### Game Not Starting
- **Problem**: Stuck in waiting room
- **Solution**: Ensure both players have joined, check browser console for errors

### Timer Desync
- **Problem**: Timers show different values
- **Solution**: Game syncs state every 2 seconds, refresh if severely desynced

### Player Disconnection
- **Problem**: Player shows as disconnected but is online
- **Solution**: Refresh the page to reconnect, check network connection

## Future Enhancements

Potential features to add:
- [ ] Different game modes (301, Cricket, etc.)
- [ ] Spectator mode
- [ ] Chat functionality
- [ ] Player statistics and history
- [ ] Tournaments and brackets
- [ ] Sound effects
- [ ] Animations for dart throws
- [ ] Elo rating system
- [ ] User accounts and profiles
- [ ] Mobile app version
- [ ] AI opponent for single player

## Credits

Built with:
- [FastAPI](https://fastapi.tiangolo.com/)
- [Socket.IO](https://socket.io/)
- [Uvicorn](https://www.uvicorn.org/)

## License

This project is open source and available for educational purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs for errors
3. Check browser console for client-side errors
4. Ensure all dependencies are installed correctly

Enjoy playing darts!
