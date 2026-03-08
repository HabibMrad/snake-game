import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DIRECTIONS,
  createFoodPosition,
  createInitialState,
  setDirection,
  tick
} from './snakeLogic.js'

test('snake moves forward on each tick', () => {
  const state = createInitialState(() => 0)
  const next = tick(state, () => 0)
  assert.equal(next.snake[0].x, state.snake[0].x + 1)
  assert.equal(next.snake[0].y, state.snake[0].y)
  assert.equal(next.snake.length, state.snake.length)
})

test('snake grows and score increases when food is eaten', () => {
  const base = createInitialState(() => 0)
  const foodState = {
    ...base,
    food: { x: base.snake[0].x + 1, y: base.snake[0].y }
  }

  const next = tick(foodState, () => 0)
  assert.equal(next.snake.length, foodState.snake.length + 1)
  assert.equal(next.score, 1)
})

test('snake wraps around at horizontal boundary', () => {
  const state = {
    snake: [{ x: 15, y: 0 }, { x: 14, y: 0 }, { x: 13, y: 0 }],
    direction: DIRECTIONS.RIGHT,
    food: { x: 5, y: 5 },
    score: 0,
    gameOver: false
  }

  const next = tick(state, () => 0)
  assert.equal(next.gameOver, false)
  assert.deepEqual(next.snake[0], { x: 0, y: 0 })
})

test('reverse direction input is ignored', () => {
  const state = createInitialState(() => 0)
  const next = setDirection(state, DIRECTIONS.LEFT)
  assert.equal(next.direction, DIRECTIONS.RIGHT)
})

test('food placement avoids occupied snake cells', () => {
  const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }]
  const food = createFoodPosition(snake, () => 0, 2)
  assert.deepEqual(food, { x: 0, y: 1 })
})

test('food placement returns null when grid is full', () => {
  const snake = [
    { x: 0, y: 0 }, { x: 1, y: 0 },
    { x: 0, y: 1 }, { x: 1, y: 1 }
  ]
  assert.equal(createFoodPosition(snake, () => 0, 2), null)
})

test('moving into previous tail cell is allowed when not eating', () => {
  const state = {
    snake: [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
      { x: 0, y: 1 }
    ],
    direction: DIRECTIONS.LEFT,
    food: { x: 3, y: 3 },
    score: 0,
    gameOver: false
  }

  const next = tick(state, () => 0)
  assert.equal(next.gameOver, false)
  assert.deepEqual(next.snake[0], { x: 0, y: 1 })
})
