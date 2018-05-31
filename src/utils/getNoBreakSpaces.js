import R from 'ramda'

import { NO_BREAK_SPACE } from './constant'

export default R.pipe(
  R.repeat(String.fromCharCode(NO_BREAK_SPACE)),
  R.reduce(R.concat, ''),
)
