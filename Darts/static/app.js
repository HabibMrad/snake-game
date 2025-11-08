// Lobby page JavaScript
let socket;
let gameId = null;
let playerId = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeSocket();
    setupEventListeners();
});

function initializeSocket() {
    socket = io({
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        showError('Disconnected from server. Please refresh the page.');
    });

    socket.on('game_created', (data) => {
        gameId = data.game_id;
        playerId = data.player_id;
        showWaitingRoom();
    });

    socket.on('game_joined', (data) => {
        gameId = data.game_id;
        playerId = data.player_id;
        redirectToGame();
    });

    socket.on('player_joined', (data) => {
        if (gameId) {
            redirectToGame();
        }
    });

    socket.on('game_started', (data) => {
        redirectToGame();
    });

    socket.on('error', (data) => {
        showError(data.message);
    });

    // Heartbeat
    setInterval(() => {
        if (socket.connected) {
            socket.emit('heartbeat', {});
        }
    }, 10000);
}

function setupEventListeners() {
    const createBtn = document.getElementById('create-btn');
    const joinBtn = document.getElementById('join-btn');
    const copyLinkBtn = document.getElementById('copy-link-btn');

    createBtn.addEventListener('click', createGame);
    joinBtn.addEventListener('click', joinGame);

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyGameLink);
    }

    // Enter key handlers
    document.getElementById('create-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createGame();
    });

    document.getElementById('join-code').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinGame();
    });
}

function createGame() {
    const nameInput = document.getElementById('create-name');
    const playerName = nameInput.value.trim();

    if (!playerName) {
        showError('Please enter your name');
        return;
    }

    socket.emit('create_game', {
        player_name: playerName
    });
}

function joinGame() {
    const nameInput = document.getElementById('join-name');
    const codeInput = document.getElementById('join-code');
    const playerName = nameInput.value.trim();
    const gameCode = codeInput.value.trim();

    if (!playerName) {
        showError('Please enter your name');
        return;
    }

    if (!gameCode) {
        showError('Please enter a game code');
        return;
    }

    socket.emit('join_game', {
        game_id: gameCode,
        player_name: playerName
    });
}

function showWaitingRoom() {
    const waitingRoom = document.getElementById('waiting-room');
    const gameLinkInput = document.getElementById('game-link');
    const gameCodeDisplay = document.getElementById('game-code');

    const gameUrl = `${window.location.origin}/game/${gameId}`;
    gameLinkInput.value = gameUrl;
    gameCodeDisplay.textContent = gameId;

    waitingRoom.classList.remove('hidden');

    // Hide the action cards
    document.querySelectorAll('.action-card').forEach(card => {
        card.style.display = 'none';
    });
    document.querySelector('.divider').style.display = 'none';
}

function copyGameLink() {
    const gameLinkInput = document.getElementById('game-link');
    gameLinkInput.select();
    document.execCommand('copy');

    const copyBtn = document.getElementById('copy-link-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';

    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

function redirectToGame() {
    window.location.href = `/game/${gameId}`;
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');

    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}
