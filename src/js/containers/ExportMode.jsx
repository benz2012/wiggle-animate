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
  render() {
    return (
      <Grid
        gridTemplateRows="auto"
        gridTemplateColumns="auto"
        alignItems="center"
        justifyItems="center"
      >
        <GridItem padding="10px">
          <h3 style={{ padding: '10px', color: 'darkgray' }}>
            Feature under construction.
          </h3>
        </GridItem>
      </Grid>
    )
  }
}

export default ExportMode
