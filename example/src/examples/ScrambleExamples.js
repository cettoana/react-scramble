import React from 'react'

import ScrambleCommon from './ScrambleCommon'

const ScrambleExamples = () => (
  <div>
    <h4>Types:</h4>
    <ul>
      <li>All</li>
      <ScrambleCommon
        text="scramble type all"
        steps={[
          {
            action: '+',
            type: 'all',
          },
        ]}
      />
      <li>Random</li>
      <ScrambleCommon
        text="scramble type random"
        steps={[
          {
            action: '+',
            type: 'random',
          },
        ]}
      />
      <li>Forward</li>
      <ScrambleCommon
        text="scramble type forward"
        steps={[
          {
            action: '+',
            type: 'forward',
          },
        ]}
      />
    </ul>
  </div>
)

export default ScrambleExamples
