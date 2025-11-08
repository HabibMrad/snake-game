// Game page JavaScript
let socket;
let gameId = null;
let playerId = null;
let gameState = null;
let dartboard = null;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    // Get game ID from URL
    const pathParts = window.location.pathname.split('/');
    gameId = pathParts[pathParts.length - 1];

    // Check if we need to show join modal
    const urlParams = new URLSearchParams(window.location.search);
    const autoJoin = urlParams.get('auto');

    if (!autoJoin) {
        showJoinModal();
    }

    // Initialize dartboard
    dartboard = new Dartboard('dartboard');
    dartboard.onDartThrow = handleDartThrow;

    // Setup event listeners
    setupEventListeners();
});

function showJoinModal() {
    const modal = document.getElementById('join-modal');
    const joinBtn = document.getElementById('modal-join-btn');
    const nameInput = document.getElementById('modal-name');

    modal.style.display = 'flex';

    joinBtn.addEventListener('click', () => {
        const playerName = nameInput.value.trim();
        if (playerName) {
            modal.style.display = 'none';
            initializeSocket(playerName);
        }
    });

    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            joinBtn.click();
        }
    });

    nameInput.focus();
}

function initializeSocket(playerName) {
    socket = io({
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log('Connected to server');
        updateConnectionStatus(true);

        // Join the game
        socket.emit('join_game', {
            game_id: gameId,
            player_name: playerName
        });
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        updateConnectionStatus(false);
    });

    socket.on('game_joined', (data) => {
        playerId = data.player_id;
        gameState = data.game_state;
        updateUI();
    });

    socket.on('player_joined', (data) => {
        gameState = data.game_state;
        updateUI();
        showNotification(`${data.player_name} joined the game!`);
    });

    socket.on('game_started', (data) => {
        gameState = data.game_state;
        updateUI();
        showNotification('Game started! Good luck!');
    });

    socket.on('dart_thrown', (data) => {
        gameState = data.game_state;
        updateUI();
        displayThrowResult(data.throw);

        if (data.game_over) {
            handleGameOver(data.winner);
        }
    });

    socket.on('player_disconnected', (data) => {
        showNotification(`${data.player_name} disconnected`);
        if (gameState) {
            const player = gameState.players[data.player_id];
            if (player) {
                player.connected = false;
            }
            updateUI();
        }
    });

    socket.on('game_state_update', (data) => {
        gameState = data.game_state;
        updateUI();
    });

    socket.on('error', (data) => {
        showNotification(data.message, 'error');
    });

    // Heartbeat
    setInterval(() => {
        if (socket && socket.connected) {
            socket.emit('heartbeat', {});
        }
    }, 10000);

    // Request game state every 2 seconds to sync timer
    setInterval(() => {
        if (socket && socket.connected && gameId) {
            socket.emit('get_game_state', { game_id: gameId });
        }
    }, 2000);
}

function setupEventListeners() {
    const leaveBtn = document.getElementById('leave-game-btn');
    const playAgainBtn = document.getElementById('play-again-btn');

    leaveBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to leave the game?')) {
            window.location.href = '/';
        }
    });

    playAgainBtn.addEventListener('click', () => {
        window.location.href = '/';
    });
}

function handleDartThrow(result) {
    if (!gameState || !gameState.game_started || gameState.game_over) {
        return;
    }

    if (gameState.current_player !== playerId) {
        showNotification('Not your turn!', 'error');
        return;
    }

    // Emit the dart throw
    socket.emit('throw_dart', {
        game_id: gameId,
        score: result.score,
        multiplier: result.multiplier
    });
}

function updateUI() {
    if (!gameState) return;

    updateScoreboard();
    updateTurnInfo();
    updateGameStatus();
    updateHistory();
    updateDartboardState();
}

function updateScoreboard() {
    const scoresContainer = document.getElementById('player-scores');
    scoresContainer.innerHTML = '';

    for (const [pid, player] of Object.entries(gameState.players)) {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'player-score';

        if (pid === gameState.current_player) {
            scoreDiv.classList.add('active');
        }

        if (pid === playerId) {
            scoreDiv.classList.add('you');
        }

        const nameDiv = document.createElement('div');
        nameDiv.className = 'player-name';
        nameDiv.innerHTML = `
            <span>${player.name} ${pid === playerId ? '(You)' : ''}</span>
            <span class="player-status ${player.connected ? '' : 'disconnected'}">
                ${player.connected ? 'Online' : 'Offline'}
            </span>
        `;

        const scoreValue = document.createElement('div');
        scoreValue.className = 'score-value';
        scoreValue.textContent = gameState.scores[pid];

        scoreDiv.appendChild(nameDiv);
        scoreDiv.appendChild(scoreValue);
        scoresContainer.appendChild(scoreDiv);
    }
}

function updateTurnInfo() {
    const turnPlayerEl = document.getElementById('turn-player');
    const timerEl = document.getElementById('timer-display');
    const dartsEl = document.getElementById('darts-display');

    if (!gameState.game_started) {
        turnPlayerEl.textContent = 'Waiting...';
        timerEl.textContent = '30';
        return;
    }

    if (gameState.game_over) {
        turnPlayerEl.textContent = 'Game Over';
        timerEl.textContent = '-';
        clearInterval(timerInterval);
        return;
    }

    const currentPlayer = gameState.players[gameState.current_player];
    if (currentPlayer) {
        turnPlayerEl.textContent = currentPlayer.name;
        if (gameState.current_player === playerId) {
            turnPlayerEl.textContent += ' (Your turn!)';
            turnPlayerEl.style.color = '#28a745';
        } else {
            turnPlayerEl.style.color = '#666';
        }
    }

    // Update timer
    updateTimer();

    // Update darts remaining
    const dartsThrown = gameState.turn_darts_thrown || 0;
    const dartsRemaining = 3 - dartsThrown;

    dartsEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const dart = document.createElement('span');
        dart.className = 'dart-icon';
        if (i >= dartsRemaining) {
            dart.classList.add('used');
        }
        dart.textContent = '🎯';
        dartsEl.appendChild(dart);
    }
}

function updateTimer() {
    const timerEl = document.getElementById('timer-display');

    if (!gameState || !gameState.game_started || gameState.game_over) {
        clearInterval(timerInterval);
        return;
    }

    const updateDisplay = () => {
        const remaining = gameState.time_remaining;
        timerEl.textContent = remaining;

        if (remaining <= 5) {
            timerEl.classList.add('warning');
        } else {
            timerEl.classList.remove('warning');
        }

        if (remaining <= 0) {
            clearInterval(timerInterval);
        }
    };

    clearInterval(timerInterval);
    updateDisplay();

    timerInterval = setInterval(() => {
        if (gameState.time_remaining > 0) {
            gameState.time_remaining--;
            updateDisplay();
        } else {
            clearInterval(timerInterval);
        }
    }, 1000);
}

function updateGameStatus() {
    const statusText = document.getElementById('status-text');

    if (!gameState.game_started) {
        if (Object.keys(gameState.players).length < 2) {
            statusText.textContent = 'Waiting for another player to join...';
        } else {
            statusText.textContent = 'Game is about to start...';
        }
    } else if (gameState.game_over) {
        statusText.textContent = 'Game finished!';
    } else {
        const currentPlayer = gameState.players[gameState.current_player];
        if (currentPlayer) {
            if (gameState.current_player === playerId) {
                statusText.textContent = 'Your turn! Click the dartboard to throw.';
            } else {
                statusText.textContent = `Waiting for ${currentPlayer.name} to throw...`;
            }
        }
    }
}

function updateHistory() {
    const historyList = document.getElementById('history-list');

    if (!gameState.history || gameState.history.length === 0) {
        historyList.innerHTML = '<p style="color: #999; text-align: center;">No throws yet</p>';
        return;
    }

    historyList.innerHTML = '';

    // Show most recent throws first
    const recentHistory = [...gameState.history].reverse();

    recentHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        if (item.bust) {
            historyItem.classList.add('bust');
        }

        if (item.result === 'Winner!') {
            historyItem.classList.add('winner');
        }

        let text = `${item.player_name}: `;

        if (item.score !== undefined) {
            const multiplierText = item.multiplier === 1 ? '' :
                                   item.multiplier === 2 ? 'D' :
                                   item.multiplier === 3 ? 'T' : '';
            text += `${multiplierText}${item.score} (${item.value} points)`;
        }

        if (item.result) {
            text += ` - ${item.result}`;
        }

        if (item.new_score !== undefined) {
            text += ` → ${item.new_score}`;
        }

        historyItem.textContent = text;
        historyList.appendChild(historyItem);
    });
}

function updateDartboardState() {
    if (!gameState) {
        dartboard.setEnabled(false);
        return;
    }

    const isMyTurn = gameState.game_started &&
                     !gameState.game_over &&
                     gameState.current_player === playerId;

    dartboard.setEnabled(isMyTurn);
}

function displayThrowResult(throwData) {
    const throwInfo = document.getElementById('throw-info');

    let message = '';
    const multiplierText = throwData.multiplier === 1 ? '' :
                          throwData.multiplier === 2 ? 'Double ' :
                          throwData.multiplier === 3 ? 'Triple ' : '';

    message = `${throwData.player_name} threw ${multiplierText}${throwData.score} (${throwData.value} points)`;

    if (throwData.result) {
        message += ` - ${throwData.result}`;
    }

    throwInfo.textContent = message;
    throwInfo.classList.remove('hidden');

    if (throwData.bust) {
        throwInfo.style.background = '#f8d7da';
        throwInfo.style.color = '#721c24';
    } else if (throwData.result === 'Winner!') {
        throwInfo.style.background = '#d4edda';
        throwInfo.style.color = '#155724';
    } else {
        throwInfo.style.background = '#d4edda';
        throwInfo.style.color = '#155724';
    }

    setTimeout(() => {
        throwInfo.classList.add('hidden');
    }, 3000);
}

function handleGameOver(winnerId) {
    const winnerDisplay = document.getElementById('winner-display');
    const winnerText = document.getElementById('winner-text');

    const winner = gameState.players[winnerId];

    if (winnerId === playerId) {
        winnerText.textContent = `Congratulations! You won! 🎉`;
    } else {
        winnerText.textContent = `${winner.name} wins! Better luck next time!`;
    }

    winnerDisplay.classList.remove('hidden');
    dartboard.setEnabled(false);
    clearInterval(timerInterval);
}

function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connection-status');
    statusEl.textContent = connected ? 'Connected' : 'Disconnected';
    statusEl.className = 'connection-status ' + (connected ? 'connected' : 'disconnected');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#f8d7da' : '#d4edda'};
        color: ${type === 'error' ? '#721c24' : '#155724'};
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
