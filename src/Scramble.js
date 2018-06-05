import * as React from 'react'
import setObservableConfig from 'recompose/setObservableConfig'
import createEventHandler from 'recompose/createEventHandler'
import compose from 'recompose/compose'
import mapPropsStream from 'recompose/mapPropsStream'
import withHandlers from 'recompose/withHandlers'
import withPropsOnChange from 'recompose/withPropsOnChange'
import lifecycle from 'recompose/lifecycle'
import {
  pluck,
  distinctUntilChanged,
  share,
  map,
  filter,
  startWith,
  mapTo,
  withLatestFrom,
  switchMap,
} from 'rxjs/operators'
import { Subject, merge, combineLatest, empty, interval, from } from 'rxjs'
import R from 'ramda'
import PropTypes from 'prop-types'

import { scramble, descramble, mixcramble } from './utils/scramblers'
import { getRandomMask, getFullMask, getForwardMask } from './utils/getMask'

const config = {
  fromESObservable: from,
  toESObservable: stream => stream,
}

setObservableConfig(config)

const omitProps = [
  'autoStart',
  'bindMethod',
  'mouseEnterTrigger',
  'mouseLeaveTrigger',
  'noBreakSpace',
  'pause',
  'preScramble',
  'reset',
  'restart',
  'speed',
  'start',
  'steps',
  'text',
]

const speed = {
  fast: 25,
  medium: 50,
  slow: 100,
}

export const getPauserStream = (
  autoStart$,
  isQueueEmpty$,
  pause$,
  reset$,
  start$
) =>
  merge(
    combineLatest(autoStart$, reset$.pipe(startWith(''))).pipe(
      map(R.head),
      map(R.not)
    ),
    pause$.pipe(mapTo(true)),
    start$.pipe(
      withLatestFrom(isQueueEmpty$),
      map(R.nth(1))
    ),
    isQueueEmpty$.pipe(filter(R.identity))
  )

export const getPropStream = (props$, key) =>
  props$.pipe(
    pluck(key),
    distinctUntilChanged()
  )

const Scramble = compose(
  mapPropsStream(props$ => {
    const { handler: start, stream: start$ } = createEventHandler()
    const { handler: pause, stream: pause$ } = createEventHandler()
    const { handler: reset, stream: reset$ } = createEventHandler()
    const queue$ = new Subject()
    const counter$ = new Subject()
    const result$ = new Subject()

    const autoStart$ = getPropStream(props$, 'autoStart')
    const preScramble$ = getPropStream(props$, 'preScramble')
    const noBreakSpace$ = getPropStream(props$, 'noBreakSpace')

    const initText$ = getPropStream(props$, 'text').pipe(share())
    const steps$ = getPropStream(props$, 'steps').pipe(share())
    const period$ = getPropStream(props$, 'speed').pipe(
      map(R.prop(R.__, speed))
    )

    const currentStep$ = queue$.pipe(
      map(R.pathOr({}, [0])),
      share()
    )

    const isQueueEmpty$ = queue$.pipe(
      map(
        R.pipe(
          R.length,
          R.equals(0)
        )
      ),
      share()
    )

    const text$ = merge(
      currentStep$.pipe(
        pluck('text'),
        filter(R.is(String))
      ),
      combineLatest(initText$, reset$.pipe(startWith(''))).pipe(map(R.head))
    ).pipe(distinctUntilChanged())

    const pauser$ = getPauserStream(
      autoStart$,
      isQueueEmpty$,
      pause$,
      reset$,
      start$
    )

    const processor$ = currentStep$.pipe(
      map(({ action, type }) => {
        switch (action) {
          case '+':
            return scramble
          case '-':
            return type === 'forward' ? mixcramble : descramble
          default:
            return R.identity
        }
      })
    )

    const mask$ = combineLatest(currentStep$, counter$, result$, text$).pipe(
      map(([{ type, roll }, counter, result, text]) => {
        const length = R.max(result.length, text.length)

        switch (type) {
          case 'random':
            return getRandomMask(length)
          case 'forward':
            return getForwardMask(length, roll, counter)
          case 'all':
          default:
            return getFullMask(length)
        }
      })
    )

    const pausableTimer$ = combineLatest(pauser$, period$).pipe(
      switchMap(
        ([paused, period]) =>
          paused
            ? empty()
            : // startWith 0 to send event immediately
              interval(period).pipe(startWith(0))
      )
    )

    merge(
      combineLatest(initText$, preScramble$, reset$.pipe(startWith(''))).pipe(
        map(
          ([text, preScramble]) =>
            preScramble ? scramble(null, text, getFullMask(text.length)) : text
        )
      ),
      pausableTimer$.pipe(
        withLatestFrom(result$, text$, processor$, mask$, noBreakSpace$),
        map(([, result, text, processor, mask, noBreakSpace]) =>
          processor(result, text, mask, noBreakSpace)
        )
      )
    ).subscribe(result$)

    merge(
      currentStep$.pipe(pluck('roll')),
      pausableTimer$.pipe(
        withLatestFrom(currentStep$, result$, text$, counter$),
        map(([, { type, action }, result, text, counter]) => {
          if (!R.isNil(counter)) {
            return counter - 1
          }

          if (type === 'forward') {
            return R.max(result.length, text.length) - 1
          }

          if (action === '-' && text === result) {
            return 0
          }

          // endless loop when counter is undefined
          return
        })
      )
    ).subscribe(counter$)

    merge(
      steps$,
      reset$.pipe(
        withLatestFrom(steps$),
        map(R.nth(1))
      ),
      counter$.pipe(
        filter(R.equals(0)),
        withLatestFrom(queue$),
        map(R.nth(1)),
        map(R.drop(1))
      )
    ).subscribe(queue$)

    return combineLatest(props$, result$).pipe(
      map(([props, result]) => ({
        ...props,
        result,
        start,
        pause,
        reset,
      }))
    )
  }),
  withPropsOnChange(['start', 'reset'], props => ({
    restart: () => {
      props.reset()
      props.start()
    },
  })),
  lifecycle({
    componentDidMount() {
      const { bindMethod } = this.props

      if (bindMethod) {
        bindMethod({
          start: this.props.start,
          pause: this.props.pause,
          reset: this.props.reset,
          restart: this.props.restart,
        })
      }
    },
  }),
  withHandlers({
    onMouseEnter: props => () => {
      const { onMouseEnter, mouseEnterTrigger } = props
      const action = props[mouseEnterTrigger]

      R.is(Function, onMouseEnter) && onMouseEnter()
      R.is(Function, action) && action()
    },
    onMouseLeave: props => () => {
      const { onMouseLeave, mouseLeaveTrigger } = props
      const action = props[mouseLeaveTrigger]

      R.is(Function, onMouseLeave) && onMouseLeave()
      R.is(Function, action) && action()
    },
  })
)(({ result = '', ...otherProps }) => (
  <span {...R.omit(omitProps, otherProps)}>{result}</span>
))

Scramble.displayName = 'Scramble'

Scramble.propTypes = {
  autoStart: PropTypes.bool,
  bindMethod: PropTypes.func,
  mouseEnterTrigger: PropTypes.oneOf(['start', 'pause', 'reset', 'restart']),
  mouseLeaveTrigger: PropTypes.oneOf(['start', 'pause', 'reset', 'restart']),
  noBreakSpace: PropTypes.bool,
  speed: PropTypes.string,
  steps: PropTypes.array,
  text: PropTypes.string,
}

Scramble.defaultProps = {
  autoStart: false,
  preScramble: false,
  steps: [],
  speed: 'medium',
  noBreakSpace: true,
}

export default Scramble
