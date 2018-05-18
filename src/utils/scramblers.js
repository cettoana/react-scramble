import R from 'ramda'

const START_CODE = 33
const END_CODE = 126
const RANGE = END_CODE - START_CODE

const randomChar = R.pipe(
  Math.random,
  R.multiply(RANGE),
  Math.floor,
  R.add(START_CODE),
  String.fromCharCode,
)

const array2String = R.reduce(R.concat, '')

export const mixcramble = (_, text = "", mask = []) => R.pipe(
  R.addIndex(R.map)((d, i) => d === 0
    ? randomChar()
    : text[i] || ''
  ),
  array2String,
)(mask)

export const descramble = (result = "", text = "", mask = []) => R.pipe(
  R.addIndex(R.map)((d, i) => d === 0
    ? result[i] || ''
    : text[i] || ''
  ),
  array2String,
)(mask)

export const scramble = (result = "", _, mask = []) => R.pipe(
  R.addIndex(R.map)((d, i) => d === 0
    ? result[i] || ''
    : randomChar()
  ),
  array2String,
)(mask)
