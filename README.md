<h1 align="center">
	<br>
	<img width="600" src="media/banner.gif" alt="react-scramble">
	<br>
	<br>
  <br>
</h1>

[![npm](https://img.shields.io/npm/v/react-scramble.svg)](https://www.npmjs.com/package/react-scramble)

React component for text scramble animation.

[Live Demo](https://cettoana.github.io/react-scramble)

## Installation

```bash
npm install react-scramble --save
```

## Usage

```javascript
import React from 'react'
import Scramble from 'react-scramble'

class App extends React.Compoent {
  render() {
    return (
      <Scramble
        autoStart
        text="Scramble me!"
        steps={[
          {
            roll: 10,
            action: '+',
            type: 'all',
          },
          {
            action: '-',
            type: 'forward',
          },
        ]}
      />
    )
  }
}
```

Remember to use `monospace` fonts to make it looks better.

## Step Format

Each step is an `Object` with following keys:

| Key                | Type     | Default   | Description                                                                             |
| :----------------- | :------- | :-------- | :-------------------------------------------------------------------------------------- |
| action             | string   |           | Action of the step, `+` as scramble, `-` as descramble and leave blank for do nothing.  |
| roll               | number   |           | Times of action in the step.                                                            |
| text               | string   |           | Change the original text.                                                               |
| type               | string   | `all`     | Scramble/descrmble type of the step, one of `all`, `random`, `forward`.                 |

## Scramble Props

| Property           | Type     | Default   | Description                                                                       |
| :----------------- | :------- | :-------- | :-------------------------------------------------------------------------------- |
| autoStart          | boolean  | false     | Set `true` to auto start animation after render.                                  |
| bindMethod         | function |           | Method binding callback function, see [Bind Methods](#bind-methods).                |
| mouseEnterTrigger  | string   |           | Event trigger type when mouse enter, one of `start`, `pause`, `reset`, `restart`. |
| mouseLeaveTrigger  | string   |           | Event trigger type when mouse leave, one of `start`, `pause`, `reset`, `restart`. |
| preScramble        | boolean  | false     | Scramble the text after render.                                                   |
| speed              | string   | `medium`  | Speed of scramble per second, one of `slow`, `mediun`, `fast`.                    |
| steps              | array    |           | Scramble steps, a list of `Object` in [Step](#step-format) format.                |
| text               | string   |           | Original text.                                                                    |

## Bind Methods

Give callback function to `bindMethod` to get the control methods of the scramble, for example

```javascript
class ScrambleCommon extends React.Component {
  render() {
    return (
      <div>
        <Scramble
          text="Nor aware of gain"
          bindMethod={c => {
            this.setState({
              start: c.start,
              pause: c.pause,
            })
          }}
          steps={[
            {
              roll: 10,
              action: '+',
              type: 'all',
            },
            {
              action: '-',
              type: 'forward',
            },
          ]}
        />
        <button onClick={() => this.state.start()}>
          Start
        </button>
        <button onClick={() => this.state.pause()}>
          Pause
        </button>
      </div>
    )
  }
}
```

methods will be set into state after Scramble component mounted.

It has the following methods: `start`, `pause`, `reset` and `restart`.

## Todo

- [ ] Accept customize speed by giving number
- [ ] Make random decramble fit roll
- [ ] More action type
- [ ] Options for random char pool
