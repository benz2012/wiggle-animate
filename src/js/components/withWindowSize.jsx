import React from 'react'

const getWidth = () => (
  window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth
)

const getHeight = () => (
  window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight
)

const withWindowSize = Component => (
  class extends React.Component {
    state = {
      width: getWidth(),
      height: getHeight(),
    }

    componentDidMount() {
      window.addEventListener('resize', this.updateDimensions)
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.updateDimensions)
    }

    updateDimensions = () => {
      const width = getWidth()
      const height = getHeight()
      this.setState({ width, height })
    }

    render() {
      const { width, height } = this.state
      return <Component width={width} height={height} {...this.props} />
    }
  }
)

export default withWindowSize
export {
  getWidth,
  getHeight,
}
