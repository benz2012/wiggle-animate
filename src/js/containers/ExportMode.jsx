/* encapsulates Mode, implements:

  | Viewer     | ExportEditor   |
  |            |                |
   ------------|                |
  | Format     |                |
  | Controller |                |

*/

import React, { Component } from 'react'

import Grid from '../components/Grid'
import GridItem from '../components/GridItem'

class ExportMode extends Component {
  saveThenDownload = () => {
    const { project } = this.props.store
    project.download(project.save())
  }

  render() {
    const { project } = this.props.store

    return (
      <Grid
        gridTemplateRows="1fr 1fr 1fr"
        gridTemplateColumns="auto"
        // alignItems="center"
        justifyItems="center"
      >
        {/* <GridItem padding="10px">
          <h3 style={{ padding: '10px', color: 'darkgray' }}>
            Feature under construction.
          </h3>
        </GridItem> */}
        <GridItem alignSelf="end">
          <button type="button" onClick={this.saveThenDownload}>&#x21e9; Save Project to File</button>
        </GridItem>
        <GridItem alignSelf="center">
          <label htmlFor="file-button" style={{ display: 'block', width: '300px' }}>&#x21aa; Load Project from File</label>
          <input type="file" id="file-button" onChange={project.loadFromFile} style={{ width: '300px' }} />
        </GridItem>
        <GridItem>
          <button type="button" onClick={project.publish}>&#x2912; Publish Project to Gallery</button>
        </GridItem>
      </Grid>
    )
  }
}

export default ExportMode
