import { getFullMask, getForwardMask } from './getMask'

test('getFullMask', () => {
  expect(getFullMask(5)).toEqual([1, 1, 1, 1, 1])
})

test('getForwardMask', () => {
  expect(getForwardMask(5, 10, 10)).toEqual([1, 0, 0, 0, 0])
  expect(getForwardMask(5, 10, 9)).toEqual([1, 0, 0, 0, 0])
  expect(getForwardMask(5, 10, 8)).toEqual([1, 1, 0, 0, 0])
  expect(getForwardMask(5, 10, 7)).toEqual([1, 1, 0, 0, 0])
  expect(getForwardMask(5, 10, 6)).toEqual([1, 1, 1, 0, 0])
  expect(getForwardMask(5, 10, 5)).toEqual([1, 1, 1, 0, 0])
  expect(getForwardMask(5, 10, 4)).toEqual([1, 1, 1, 1, 0])
  expect(getForwardMask(5, 10, 3)).toEqual([1, 1, 1, 1, 0])
  expect(getForwardMask(5, 10, 2)).toEqual([1, 1, 1, 1, 1])
  expect(getForwardMask(5, 10, 1)).toEqual([1, 1, 1, 1, 1])

  expect(getForwardMask(5, 3, 3)).toEqual([1, 0, 0, 0, 0])
  expect(getForwardMask(5, 3, 2)).toEqual([1, 1, 0, 0, 0])
  expect(getForwardMask(5, 3, 1)).toEqual([1, 1, 1, 1, 1])

  expect(getForwardMask(5, 8, 8)).toEqual([1, 0, 0, 0, 0])
  expect(getForwardMask(5, 8, 7)).toEqual([1, 0, 0, 0, 0])
  expect(getForwardMask(5, 8, 6)).toEqual([1, 1, 0, 0, 0])
  expect(getForwardMask(5, 8, 5)).toEqual([1, 1, 0, 0, 0])
  expect(getForwardMask(5, 8, 4)).toEqual([1, 1, 1, 0, 0])
  expect(getForwardMask(5, 8, 3)).toEqual([1, 1, 1, 0, 0])
  expect(getForwardMask(5, 8, 2)).toEqual([1, 1, 1, 1, 0])
  expect(getForwardMask(5, 8, 1)).toEqual([1, 1, 1, 1, 1])

  expect(getForwardMask(5)).toEqual([1, 0, 0, 0, 0])
})

const mockMath = Object.create(global.Math)
mockMath.random = () => 0.5
global.Math = mockMath

test('getRandomMask', () => {
  expect(getFullMask(5)).toEqual([1, 1, 1, 1, 1])
})
