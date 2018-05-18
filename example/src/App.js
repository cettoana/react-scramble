import React, { Component } from 'react'

import Title from './components/Title'
import './App.css'

import ScrambleExamples from './examples/ScrambleExamples'
import DescrambleExamples from './examples/DescrambleExamples'

class App extends Component {
  state = { dps: 25 }

  start = () => {
    this.state.start()
  }

  pause = () => {
    this.state.pause()
  }

  render() {
    return (
      <div className="App">
        <section>
          <Title />
        </section>
        <section>
          <div className="App-examples-wrap">
            <h3>Scramble</h3>
            <ScrambleExamples />
          </div>
        </section>
        <section>
          <div className="App-examples-wrap">
            <h3>Descramble</h3>
            <DescrambleExamples />
          </div>
        </section>
      </div>
    )
  }
}

export default App
