# Testing Guide - Multiplayer Darts Game

## Pre-Testing Setup

1. **Verify Installation**
   ```bash
   python test_installation.py
   ```
   Expected output: `[SUCCESS] All tests passed!`

2. **Start the Server**
   ```bash
   python app.py
   ```
   Expected output:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

## Testing Scenarios

### Scenario 1: Basic Two-Player Game

**Setup:**
1. Open Browser 1: `http://localhost:8000`
2. Open Browser 2 (incognito): `http://localhost:8000`

**Test Steps:**

1. **Create Game (Browser 1)**
   - Enter name: "Alice"
   - Click "Create New Game"
   - ✓ Verify: Waiting room appears
   - ✓ Verify: Game link is displayed
   - ✓ Verify: Game code is shown
   - **Copy the game link**

2. **Join Game (Browser 2)**
   - Paste the game link in address bar
   - Enter name: "Bob"
   - Click "Join Game"
   - ✓ Verify: Both players see each other
   - ✓ Verify: Game starts automatically
   - ✓ Verify: Scores show 501 for both

3. **Play First Turn (Browser 1 - Alice)**
   - ✓ Verify: "Your turn!" message shows
   - ✓ Verify: Dartboard is clickable
   - ✓ Verify: Timer counts down from 30
   - Click center bullseye
   - ✓ Verify: Score updates (501 → 451)
   - ✓ Verify: "Darts Left" shows 2 remaining
   - ✓ Verify: Browser 2 sees the same throw
   - Click dartboard 2 more times
   - ✓ Verify: Turn switches to Bob

4. **Play Second Turn (Browser 2 - Bob)**
   - ✓ Verify: "Your turn!" appears
   - ✓ Verify: Browser 1 shows "Waiting for Bob"
   - Throw 3 darts
   - ✓ Verify: Scores update correctly
   - ✓ Verify: Turn switches back to Alice

5. **Check Game History**
   - ✓ Verify: Both browsers show recent throws
   - ✓ Verify: Player names appear in history
   - ✓ Verify: Scores are correct

### Scenario 2: Winning the Game

**Setup:** Start with low scores (modify server or play until low)

**Test Steps:**

1. **Get to Winning Position**
   - Play until one player has 50 points left

2. **Win on Double**
   - Click on the outer ring of 25 (bullseye area) for double
   - ✓ Verify: "Winner!" message appears
   - ✓ Verify: Game over screen shows
   - ✓ Verify: Both players see winner announcement
   - ✓ Verify: "Play Again" button appears
   - ✓ Verify: Dartboard is disabled

3. **Attempt Invalid Win**
   - Player with 50 points left
   - Click center bullseye (single 25)
   - ✓ Verify: Score doesn't go to 25
   - ✓ Verify: Should bust or not be valid win

### Scenario 3: Bust Rule Testing

**Test Steps:**

1. **Go Below Zero**
   - Player has 10 points left
   - Throw a 20 (goes to -10)
   - ✓ Verify: "Bust!" message appears
   - ✓ Verify: Score returns to 10
   - ✓ Verify: Turn ends immediately

2. **Land on 1**
   - Player has 11 points left
   - Throw a 10 (goes to 1)
   - ✓ Verify: Bust occurs
   - ✓ Verify: Score returns to 11

### Scenario 4: Timer Functionality

**Test Steps:**

1. **Wait for Timer**
   - Start your turn
   - Don't click dartboard
   - ✓ Verify: Timer counts down
   - ✓ Verify: Timer turns red at 5 seconds
   - ✓ Verify: Turn skips at 0 seconds
   - ✓ Verify: History shows "Turn timed out"

### Scenario 5: Connection Handling

**Test Steps:**

1. **Player Disconnects**
   - Close Browser 2
   - ✓ Verify: Browser 1 shows "Player disconnected"
   - ✓ Verify: Player status shows "Offline"

2. **Player Reconnects**
   - Reopen the game link in Browser 2
   - Enter same name: "Bob"
   - ✓ Verify: Reconnects to same game
   - ✓ Verify: Game state is preserved
   - ✓ Verify: Status shows "Online" again

### Scenario 6: Dartboard Accuracy

**Test Steps:**

1. **Test Bullseye**
   - Click exact center
   - ✓ Verify: Shows "50 points" (double bull)
   - Click slightly off center (green area)
   - ✓ Verify: Shows "25 points" (single bull)

2. **Test Doubles**
   - Click outer ring on number 20
   - ✓ Verify: Shows "D20 (40 points)"

3. **Test Triples**
   - Click inner colored ring on number 20
   - ✓ Verify: Shows "T20 (60 points)"

4. **Test Singles**
   - Click regular area on number 20
   - ✓ Verify: Shows "20 (20 points)"

### Scenario 7: Edge Cases

**Test Steps:**

1. **Throw Out of Turn**
   - When it's not your turn
   - Try clicking dartboard
   - ✓ Verify: Shows "Not your turn!" error

2. **Join Full Game**
   - Three players try to join same game
   - ✓ Verify: Third player gets "Game is full" error

3. **Invalid Game Code**
   - Try joining with fake code "INVALID123"
   - ✓ Verify: Shows "Game not found" error

4. **Rapid Clicking**
   - Click dartboard very fast multiple times
   - ✓ Verify: Only counts 3 darts per turn
   - ✓ Verify: No extra throws registered

### Scenario 8: Mobile Responsiveness

**Test Steps:**

1. **Resize Browser**
   - Make window very narrow
   - ✓ Verify: Layout adapts
   - ✓ Verify: Dartboard remains clickable
   - ✓ Verify: All controls accessible

2. **Touch Devices** (if available)
   - Test on phone/tablet
   - ✓ Verify: Touch clicks work on dartboard
   - ✓ Verify: UI is readable
   - ✓ Verify: Buttons are tappable

## Performance Testing

### Load Test

1. **Multiple Games**
   - Open 4+ browser windows
   - Create 2 separate games
   - Play simultaneously
   - ✓ Verify: All games work independently
   - ✓ Verify: No cross-game interference

2. **Long Session**
   - Play for 10+ minutes
   - ✓ Verify: No memory leaks
   - ✓ Verify: Timer stays accurate
   - ✓ Verify: Connection remains stable

## Network Testing

### Local Network Test

1. **Find Your Local IP**
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. **Connect from Another Device**
   - On same WiFi network
   - Open `http://[YOUR-IP]:8000`
   - ✓ Verify: Game works across devices

### Latency Test

1. **Check WebSocket Messages**
   - Open Browser Developer Tools (F12)
   - Go to Network tab → WS (WebSocket)
   - Monitor Socket.IO messages
   - ✓ Verify: Messages arrive quickly (<100ms local)

## Server Testing

### Console Logs

**Monitor server output for:**
- `Client connected: [sid]`
- `Game created: [game_id]`
- `Player joined game [game_id]: [name]`
- `Dart thrown in game [game_id]: [score]x[multiplier]`
- `Client disconnected: [sid]`

✓ Verify: No error messages
✓ Verify: Events logged correctly

### Error Handling

1. **Server Restart During Game**
   - Stop server (Ctrl+C)
   - ✓ Verify: Browsers show "Disconnected"
   - Restart server
   - ✓ Verify: Refresh reconnects (new game needed)

## Bug Checklist

Common issues to check:

- [ ] Scores update correctly for both players
- [ ] Timer synchronizes between browsers
- [ ] Bust rule works properly
- [ ] Can't throw more than 3 darts per turn
- [ ] Can't throw when not your turn
- [ ] Winner must finish on double
- [ ] Disconnected players show as offline
- [ ] Game history displays correctly
- [ ] No JavaScript errors in console
- [ ] No Python errors in server log

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (Mac)
- [ ] Edge
- [ ] Mobile browsers

## Acceptance Criteria

Game is ready when:

✓ Two players can create and join a game
✓ Dartboard clicks register correctly
✓ Scores update in real-time
✓ Turn timer works
✓ Bust rules enforced
✓ Winner declared on double finish
✓ Players can disconnect/reconnect
✓ No errors in console or server logs
✓ Play again works
✓ Mobile responsive

## Troubleshooting

### Issue: Can't connect to server
**Solution:** Check if server is running, verify port 8000 is free

### Issue: WebSocket connection fails
**Solution:** Refresh page, check firewall settings

### Issue: Timer desynchronized
**Solution:** Refresh page to resync (game syncs every 2 seconds)

### Issue: Dartboard not clickable
**Solution:** Verify it's your turn, check JavaScript console

### Issue: Scores not updating
**Solution:** Check network tab for WebSocket errors, refresh page

## Final Verification

Before deploying or sharing:

```bash
# Run installation test
python test_installation.py

# Start server
python app.py

# Open two browsers
# Play complete game
# Test all features above
```

**All tests passing?** ✓ Ready to play!

---

Happy Testing! 🎯
