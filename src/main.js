import './style.css'
import {
  GRID_SIZE,
  createInitialState,
  getDirectionFromInput,
  setDirection,
  tick
} from './snakeLogic.js'

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="game">
    <header class="hud">
      <h1>Snake</h1>
      <p>Score: <span id="score">0</span></p>
    </header>
    <section id="grid" class="grid" aria-label="Snake game grid"></section>
    <div class="status">
      <p id="status">Press any arrow key or WASD to start.</p>
      <div class="actions">
        <button id="pause-btn" type="button">Pause</button>
        <button id="restart-btn" type="button">Restart</button>
      </div>
    </div>
    <div class="controls" aria-label="On-screen controls">
      <button data-input="up" type="button">Up</button>
      <div>
        <button data-input="left" type="button">Left</button>
        <button data-input="down" type="button">Down</button>
        <button data-input="right" type="button">Right</button>
      </div>
    </div>
  </main>
`

const grid = document.querySelector('#grid')
const scoreText = document.querySelector('#score')
const statusText = document.querySelector('#status')
const pauseBtn = document.querySelector('#pause-btn')
const restartBtn = document.querySelector('#restart-btn')
const controls = document.querySelector('.controls')

const cells = []
for (let y = 0; y < GRID_SIZE; y += 1) {
  for (let x = 0; x < GRID_SIZE; x += 1) {
    const cell = document.createElement('div')
    cell.className = 'cell'
    cell.dataset.x = String(x)
    cell.dataset.y = String(y)
    grid.appendChild(cell)
    cells.push(cell)
  }
}

let state = createInitialState()
let started = false
let paused = false
let timer = null

function getCell(x, y) {
  return cells[y * GRID_SIZE + x]
}

function clearClasses() {
  for (const cell of cells) {
    cell.classList.remove('snake', 'head', 'food')
  }
}

function render() {
  clearClasses()
  for (let i = 0; i < state.snake.length; i += 1) {
    const part = state.snake[i]
    const cell = getCell(part.x, part.y)
    if (!cell) continue
    cell.classList.add('snake')
    if (i === 0) cell.classList.add('head')
  }

  if (state.food) {
    const foodCell = getCell(state.food.x, state.food.y)
    if (foodCell) foodCell.classList.add('food')
  }

  scoreText.textContent = String(state.score)

  if (state.gameOver) {
    statusText.textContent = 'Game over. Press Restart.'
  } else if (paused) {
    statusText.textContent = 'Paused.'
  } else if (!started) {
    statusText.textContent = 'Press any arrow key or WASD to start.'
  } else {
    statusText.textContent = 'Running.'
  }
}

function step() {
  if (state.gameOver || paused || !started) return
  state = tick(state)
  render()
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  stopTimer()
  timer = setInterval(step, 180)
}

function restart() {
  state = createInitialState()
  paused = false
  started = false
  pauseBtn.textContent = 'Pause'
  render()
}

function onInput(input) {
  const direction = getDirectionFromInput(input)
  if (!direction) return
  if (!started) {
    started = true
    startTimer()
  }
  state = setDirection(state, direction)
  if (paused) {
    paused = false
    pauseBtn.textContent = 'Pause'
  }
  render()
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    if (!state.gameOver && started) {
      paused = !paused
      pauseBtn.textContent = paused ? 'Resume' : 'Pause'
      render()
    }
    return
  }
  onInput(event.key)
})

controls.addEventListener('click', (event) => {
  const input = event.target.dataset.input
  if (input) onInput(input)
})

pauseBtn.addEventListener('click', () => {
  if (state.gameOver || !started) return
  paused = !paused
  pauseBtn.textContent = paused ? 'Resume' : 'Pause'
  render()
})

restartBtn.addEventListener('click', restart)

restart()
