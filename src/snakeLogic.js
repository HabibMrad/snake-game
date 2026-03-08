export const GRID_SIZE = 16

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
}

const OPPOSITE = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT'
}

export function directionName(direction) {
  return Object.keys(DIRECTIONS).find(
    (key) => DIRECTIONS[key].x === direction.x && DIRECTIONS[key].y === direction.y
  )
}

export function createFoodPosition(snake, random = Math.random, gridSize = GRID_SIZE) {
  const occupied = new Set(snake.map((part) => `${part.x},${part.y}`))
  const free = []
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`
      if (!occupied.has(key)) free.push({ x, y })
    }
  }

  if (free.length === 0) return null
  const index = Math.floor(random() * free.length)
  return free[index]
}

export function createInitialState(random = Math.random) {
  const center = Math.floor(GRID_SIZE / 2)
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center }
  ]
  return {
    snake,
    direction: DIRECTIONS.RIGHT,
    food: createFoodPosition(snake, random),
    score: 0,
    gameOver: false
  }
}

export function setDirection(state, nextDirection) {
  if (state.gameOver) return state
  const currentName = directionName(state.direction)
  const nextName = directionName(nextDirection)
  if (!currentName || !nextName) return state
  if (OPPOSITE[currentName] === nextName) return state
  return { ...state, direction: nextDirection }
}

function hasSnakeCollision(head, snake) {
  return snake.some((part) => part.x === head.x && part.y === head.y)
}

export function tick(state, random = Math.random) {
  if (state.gameOver) return state

  const rawNextHead = {
    x: state.snake[0].x + state.direction.x,
    y: state.snake[0].y + state.direction.y
  }
  const nextHead = {
    x: (rawNextHead.x + GRID_SIZE) % GRID_SIZE,
    y: (rawNextHead.y + GRID_SIZE) % GRID_SIZE
  }

  const ateFood = state.food && nextHead.x === state.food.x && nextHead.y === state.food.y
  const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1)

  if (hasSnakeCollision(nextHead, bodyToCheck)) {
    return { ...state, gameOver: true }
  }

  const nextSnake = [nextHead, ...state.snake]
  if (!ateFood) {
    nextSnake.pop()
  }

  return {
    ...state,
    snake: nextSnake,
    food: ateFood ? createFoodPosition(nextSnake, random) : state.food,
    score: ateFood ? state.score + 1 : state.score
  }
}

export function getDirectionFromInput(input) {
  const value = String(input).toLowerCase()
  if (value === 'arrowup' || value === 'w' || value === 'up') return DIRECTIONS.UP
  if (value === 'arrowdown' || value === 's' || value === 'down') return DIRECTIONS.DOWN
  if (value === 'arrowleft' || value === 'a' || value === 'left') return DIRECTIONS.LEFT
  if (value === 'arrowright' || value === 'd' || value === 'right') return DIRECTIONS.RIGHT
  return null
}
