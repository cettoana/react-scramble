import React from 'react'

import ScrambleCommon from './ScrambleCommon'

const DescrambleExamples = () => (
  <div>
    <h4>Types:</h4>
    <ul>
      <li>All</li>
      <ScrambleCommon
        text="descramble type all"
        preScramble
        steps={[
          {
            action: '-',
            type: 'all',
          },
        ]}
      />
      <li>Random</li>
      <ScrambleCommon
        text="descramble type random"
        preScramble
        steps={[
          {
            action: '-',
            type: 'random',
          },
        ]}
      />
      <li>Forward</li>
      <ScrambleCommon
        text="descramble type forward"
        preScramble
        steps={[
          {
            action: '-',
            type: 'forward',
          },
        ]}
      />
    </ul>
  </div>
)

export default DescrambleExamples
