# Snake Game

A classic Snake game built with HTML5 Canvas and vanilla JavaScript. Control the snake, eat food, grow longer, and try to beat your high score!

![Snake Game](https://img.shields.io/badge/Game-Snake-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

## Features

- **Classic Gameplay**: Navigate the snake to eat food and grow longer
- **No Borders**: Snake wraps around the edges of the game board
- **Score Tracking**: Keep track of your current score and high score
- **Persistent High Score**: Your best score is saved in browser localStorage
- **Smooth Controls**: Use arrow keys for precise movement
- **Pause/Resume**: Pause the game anytime with the pause button or spacebar
- **Beautiful UI**: Modern gradient design with glowing effects
- **Responsive Design**: Works on different screen sizes

## How to Play

1. Open `index.html` in your web browser
2. Click the **Start Game** button
3. Use the **Arrow Keys** to control the snake:
   - ↑ Up Arrow - Move up
   - ↓ Down Arrow - Move down
   - ← Left Arrow - Move left
   - → Right Arrow - Move right
4. Press **Spacebar** to pause/resume the game
5. Eat the red food to grow longer and increase your score
6. Avoid running into yourself!

## Game Rules

- The snake moves continuously in the current direction
- Eating food increases your score by 10 points and makes the snake grow
- The snake wraps around the edges (no walls to crash into)
- Game ends only when the snake collides with itself
- Your high score is automatically saved

## Installation

### Option 1: Play Locally

1. Clone this repository:
```bash
git clone https://github.com/HabibMrad/snake-game.git
```

2. Navigate to the project folder:
```bash
cd snake-game
```

3. Open `index.html` in your web browser:
   - Double-click the file, or
   - Right-click and select "Open with" your preferred browser

### Option 2: Play Online

Visit the live demo: [Play Snake Game](https://habibmrad.github.io/snake-game/)

## Project Structure

```
snake-game/
│
├── index.html      # Main HTML structure
├── game.js         # Game logic and mechanics
├── style.css       # Styling and animations
└── README.md       # Project documentation
```

## Technologies Used

- **HTML5 Canvas**: For rendering the game graphics
- **JavaScript (ES6)**: For game logic and interactivity
- **CSS3**: For styling and visual effects
- **LocalStorage API**: For saving high scores

## Controls Summary

| Key | Action |
|-----|--------|
| ↑ | Move Up |
| ↓ | Move Down |
| ← | Move Left |
| → | Move Right |
| Spacebar | Pause/Resume |

## Customization

You can easily customize the game by modifying these values in `game.js`:

- **Game Speed**: Change the timeout value on line 45 (lower = faster)
  ```javascript
  gameLoop = setTimeout(drawGame, 200); // 200ms delay
  ```

- **Grid Size**: Modify the `gridSize` constant on line 12
  ```javascript
  const gridSize = 20; // Size of each grid cell
  ```

- **Colors**: Update colors in `style.css` or in the drawing functions in `game.js`

## Browser Compatibility

Works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Habib Mrad**
- GitHub: [@HabibMrad](https://github.com/HabibMrad)

## Acknowledgments

- Inspired by the classic Nokia Snake game
- Built with vanilla JavaScript for educational purposes

---

Enjoy the game! 🐍
