# Quick Start Guide

Get your multiplayer darts game running in 3 minutes!

## Installation

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server**:
   ```bash
   python app.py
   ```

3. **Open your browser**:
   ```
   http://localhost:8000
   ```

## Testing with Two Players (Same Computer)

### Option 1: Two Browser Windows
1. Open `http://localhost:8000` in Chrome
2. Click "Create New Game", enter name "Player 1"
3. Copy the game link that appears
4. Open `http://localhost:8000` in Firefox (or another browser)
5. Paste the link or use "Join Game" with the code
6. Play!

### Option 2: Incognito Mode
1. Open `http://localhost:8000` in normal browser
2. Create a game as "Player 1"
3. Copy the game link
4. Open an incognito/private window
5. Paste the link
6. Play!

## Playing the Game

### Dartboard Zones
- **Center (Red)**: Bullseye = 50 points
- **Outer Bull (Green)**: 25 points
- **Inner Colored Ring**: Triple = 3x segment number
- **Outer Colored Ring**: Double = 2x segment number
- **Single Areas**: Face value (1-20)

### Rules
- Start at 501 points
- Reduce score to exactly 0 to win
- Must finish on a double
- 3 darts per turn
- 30 seconds per turn

### Winning Example
- If you have 32 points left:
  - Throw Double 16 to win!
- If you have 50 points left:
  - Throw Bullseye (50 = Double 25) to win!

## Troubleshooting

### Can't install dependencies?
```bash
# Try using pip3
pip3 install -r requirements.txt

# Or with Python directly
python -m pip install -r requirements.txt
```

### Port 8000 already in use?
Edit `app.py` line 280 and change port:
```python
uvicorn.run(socket_app, host="0.0.0.0", port=8080, log_level="info")
```

### Server won't start?
Check Python version:
```bash
python --version
# Should be 3.8 or higher
```

## Next Steps

See [README.md](README.md) for:
- Complete feature list
- Architecture details
- Deployment instructions
- Advanced configuration

Enjoy your game!
