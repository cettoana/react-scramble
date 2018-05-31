import * as React from 'react'
import rxjsObservableConfig from 'recompose/rxjsObservableConfig'
import setObservableConfig from 'recompose/setObservableConfig'
import createEventHandler from 'recompose/createEventHandler'
import compose from 'recompose/compose'
import setPropTypes from 'recompose/setPropTypes'
import mapPropsStream from 'recompose/mapPropsStream'
import withHandlers from 'recompose/withHandlers'
import withPropsOnChange from 'recompose/withPropsOnChange'
import lifecycle from 'recompose/lifecycle'
import Rx from 'rxjs'
import R from 'ramda'
import PropTypes from 'prop-types'

import { scramble, descramble, mixcramble } from './utils/scramblers'
import { getRandomMask, getFullMask, getForwardMask } from './utils/getMask'

setObservableConfig(rxjsObservableConfig)

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

export default compose(
  setPropTypes({
    autoStart: PropTypes.bool,
    bindMethod: PropTypes.func,
    mouseEnterTrigger: PropTypes.oneOf(['start', 'pause', 'reset', 'restart']),
    mouseLeaveTrigger: PropTypes.oneOf(['start', 'pause', 'reset', 'restart']),
    noBreakSpace: PropTypes.bool,
    speed: PropTypes.string,
    steps: PropTypes.array,
    text: PropTypes.string,
  }),
  mapPropsStream(props$ => {
    const { handler: start, stream: start$ } = createEventHandler()
    const { handler: pause, stream: pause$ } = createEventHandler()
    const { handler: reset, stream: reset$ } = createEventHandler()
    const queue$ = new Rx.Subject()
    const counter$ = new Rx.Subject()
    const result$ = new Rx.Subject()

    const autoStart$ = props$
      .map(R.propOr(false, 'autoStart'))
      .distinctUntilChanged()

    const preScramble$ = props$
      .map(R.propOr(false, 'preScramble'))
      .distinctUntilChanged()

    const initText$ = props$
      .pluck('text')
      .distinctUntilChanged()
      .share()

    const steps$ = props$
      .map(R.propOr([], 'steps'))
      .distinctUntilChanged()
      .share()

    const period$ = props$
      .map(R.propOr('medium', 'speed'))
      .distinctUntilChanged()
      .map(R.prop(R.__, speed))

    const noBreakSpace$ = props$
      .map(R.propOr(true, 'noBreakSpace'))
      .distinctUntilChanged()

    const currentStep$ = queue$
      .map(R.pathOr({}, [0]))
      .share()

    const text$ = currentStep$
      .map(R.prop('text'))
      .filter(R.is(String))
      .merge(initText$.combineLatest(reset$.startWith(''), R.identity))
      .distinctUntilChanged()

    const pauser$ = Rx.Observable.merge(
      autoStart$.map(R.not),
      pause$.mapTo(true),
      reset$.withLatestFrom(autoStart$, (_, autoStart) => !autoStart),
      start$.withLatestFrom(queue$, (_, queue) => queue.length === 0),
      queue$
        .map(queue => queue.length === 0)
        .filter(R.identity),
    )

    const processor$ = currentStep$.map(({ action, type }) => {
      switch(action) {
        case '+':
          return scramble
        case '-':
          return type === 'forward' ? mixcramble : descramble
        default:
          return R.identity
      }
    })

    const mask$ = Rx.Observable
      .combineLatest(
        currentStep$,
        counter$,
        result$,
        text$,
        ({ type, roll }, counter, result, text) => {
          const length = R.max(result.length, text.length)

          switch(type) {
            case 'random':
              return getRandomMask(length)
            case 'forward':
              return getForwardMask(length, roll, counter)
            case 'all':
            default:
              return getFullMask(length)
          }
        }
      )

    const pausableTimer$ = pauser$
      .combineLatest(period$)
      .switchMap(([paused, period]) => paused
        ? Rx.Observable.empty()
        // startWith 0 to send event immediately
        : Rx.Observable.interval(period).startWith(0)
      )

    Rx.Observable
      .merge(
        initText$
          .combineLatest(
            preScramble$,
            reset$.startWith(''),
            (text, preScramble) => preScramble
              ? scramble(null, text, getFullMask(text.length))
              : text
          ),
        pausableTimer$
          .withLatestFrom(
            result$,
            text$,
            processor$,
            mask$,
            noBreakSpace$,
            (_, result, text, processor, mask, noBreakSpace) => processor(result, text, mask, noBreakSpace),
          )
      )
      .subscribe(result$)

    Rx.Observable
      .merge(
        currentStep$.map(R.prop('roll')),
        pausableTimer$
          .withLatestFrom(
            currentStep$,
            result$,
            text$,
            counter$,
            (_, { type, action }, result, text, counter) => {
              if (!R.isNil(counter)) {
                return counter - 1
              }

              if (type === 'forward') {
                return R.max(result.length, text.length)
              }

              if (action === '-' && text === result) {
                return 0
              }

              // endless loop when counter is undefined
              return
            }
          ),
      )
      .subscribe(counter$)

    Rx.Observable
      .merge(
        steps$,
        reset$.withLatestFrom(steps$, R.nthArg(1)),
        counter$
          .filter(R.equals(0))
          .withLatestFrom(queue$, R.nthArg(1))
          .map(R.drop(1)),
      )
      .subscribe(queue$)

    return props$.combineLatest(
      result$,
      (props, result) => ({
        ...props,
        result,
        start,
        pause,
        reset,
      })
    )
  }),
  withPropsOnChange(
    ['start', 'reset'],
    props => ({
      restart: () => {
        props.reset()
        props.start()
      },
    })
  ),
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
      const {
        onMouseEnter,
        mouseEnterTrigger,
      } = props
      const action = props[mouseEnterTrigger]

      R.is(Function, onMouseEnter) && onMouseEnter()
      R.is(Function, action) && action()
    },
    onMouseLeave: props => () => {
      const {
        onMouseLeave,
        mouseLeaveTrigger,
      } = props
      const action = props[mouseLeaveTrigger]

      R.is(Function, onMouseLeave) && onMouseLeave()
      R.is(Function, action) && action()
    },
  }),
)(({ result = '', ...otherProps}) => (
  <span {...R.omit(omitProps, otherProps)}>
    {result}
  </span>
))
