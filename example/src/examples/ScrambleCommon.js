import React from 'react'
import PropTypes from 'prop-types'
import Scramble from 'react-scramble'

import './ScrambleCommon.css'

class ScrambleCommon extends React.Component {
  render() {
    return (
      <section className="Scramble-section">
        <div>
          <Scramble
            className="Scramble-common"
            preScramble={this.props.preScramble}
            text={this.props.text}
            bindMethod={c => {
              this.setState({
                start: c.start,
                pause: c.pause,
                reset: c.reset,
              })
            }}
            steps={this.props.steps}
          />
        </div>
        <div>
          <button onClick={() => this.state.start()}>
            <i className="fas fa-play" />
          </button>
          <button onClick={() => this.state.pause()}>
            <i className="fas fa-pause" />
          </button>
          <button onClick={() => this.state.reset()}>
            <i className="fas fa-redo" />
          </button>
        </div>
      </section>
    )
  }
}

ScrambleCommon.propTypes = {
  steps: PropTypes.array,
  text: PropTypes.string,
  preScramble: PropTypes.bool,
}

export default ScrambleCommon
