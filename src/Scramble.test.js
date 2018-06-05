import { getPauserStream, getPropStream } from './Scramble'
import R from 'ramda'
import { TestScheduler } from 'rxjs/testing'

const assert = (actual, expected) => {
  const isEqual = R.equals(actual, expected)
  if (!isEqual) {
    console.error('Actual:', actual, '\n\n', 'Expected:', expected) // eslint-disable-line
  }
  expect(isEqual).toBe(true)
}

test('getPauserStream, auto start and queue is not empty', () => {
  const testScheduler = new TestScheduler(assert)

  testScheduler.run(({ cold, expectObservable, flush }) => {
    const autoStartMarble = cold('T----------|', { T: true })
    const isQueueEmptyMarble = cold('F----------|', { F: false })
    const pauseMarble = cold('------x----|')
    const resetMarble = cold('----------x|')
    const startMarble = cold('--------x--|')
    const resultMarble = 'F-----T-F-F|'

    const source = getPauserStream(
      autoStartMarble,
      isQueueEmptyMarble,
      pauseMarble,
      resetMarble,
      startMarble
    )
    const values = {
      T: true,
      F: false,
    }

    expectObservable(source).toBe(resultMarble, values)

    flush()
  })
})

test('getPauserStream, queue is not empty', () => {
  const testScheduler = new TestScheduler(assert)

  testScheduler.run(({ cold, expectObservable, flush }) => {
    const autoStartMarble = cold('F---------|', { F: false })
    const isQueueEmptyMarble = cold('F---------|', { F: false })
    const pauseMarble = cold('-----x----|')
    const resetMarble = cold('---------x|')
    const startMarble = cold('-------x--|')
    const resultMarble = 'T----T-F-T|'

    const source = getPauserStream(
      autoStartMarble,
      isQueueEmptyMarble,
      pauseMarble,
      resetMarble,
      startMarble
    )
    const values = {
      T: true,
      F: false,
    }

    expectObservable(source).toBe(resultMarble, values)

    flush()
  })
})

test('getPauserStream, queue is empty', () => {
  const testScheduler = new TestScheduler(assert)

  testScheduler.run(({ cold, expectObservable, flush }) => {
    const autoStartMarble = cold('F---------|', { F: false })
    const isQueueEmptyMarble = cold('T---------|', { T: true })
    const pauseMarble = cold('-----x----|')
    const resetMarble = cold('---------x|')
    const startMarble = cold('-------x--|')
    const resultMarble = '(TT)-T-T-T|'

    const source = getPauserStream(
      autoStartMarble,
      isQueueEmptyMarble,
      pauseMarble,
      resetMarble,
      startMarble
    )
    const values = {
      T: true,
      F: false,
    }

    expectObservable(source).toBe(resultMarble, values)

    flush()
  })
})

test('getPropStream', () => {
  const testScheduler = new TestScheduler(assert)

  testScheduler.run(({ cold, expectObservable, flush }) => {
    const propsMarble = cold('p----p--q-|', {
      p: { foo: 'bar' },
      q: { foo: 'xyz' },
    })
    const resultMarble = 'r-------s-|'

    const source = getPropStream(propsMarble, 'foo')
    const values = { r: 'bar', s: 'xyz' }

    expectObservable(source).toBe(resultMarble, values)

    flush()
  })
})
