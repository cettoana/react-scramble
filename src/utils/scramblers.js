import R from 'ramda'

import {
  PRINTABLE_CHAR_CODES,
  NO_BREAK_SPACE_CHAR_CODE,
} from './constant'

const noBreakSpace = String.fromCharCode(NO_BREAK_SPACE_CHAR_CODE)

const randomChar = () => R.pipe(
  R.concat([NO_BREAK_SPACE_CHAR_CODE]),
  array => array[Math.floor(Math.random() * array.length)],
  String.fromCharCode,
)(PRINTABLE_CHAR_CODES)

const array2String = R.reduce(R.concat, '')

export const mixcramble = (_, text = "", mask = [], noBreakSpaceFlag) => R.pipe(
  R.addIndex(R.map)((d, i) => d === 0
    ? randomChar()
    : text[i] || (noBreakSpaceFlag ? noBreakSpace : '')
  ),
  array2String,
)(mask)

export const descramble = (result = "", text = "", mask = [], noBreakSpaceFlag) => R.pipe(
  R.addIndex(R.map)((d, i) => d === 0
    ? result[i] || (noBreakSpaceFlag ? noBreakSpace : '')
    : text[i] || (noBreakSpaceFlag ? noBreakSpace : '')
  ),
  array2String,
)(mask)

export const scramble = (result = "", _, mask = [], noBreakSpaceFlag) => R.pipe(
  R.addIndex(R.map)((d, i) => d === 0
    ? result[i] || (noBreakSpaceFlag ? noBreakSpace : '')
    : randomChar()
  ),
  array2String,
)(mask)
