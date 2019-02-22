// import { createMuiTheme } from '@material-ui/core/styles'
// import blue from '@material-ui/core/colors/blue'
// import red from '@material-ui/core/colors/red'
//
// const theme = createMuiTheme({
//   palette: {
//     primary: red,
//   },
//   typography: { useNextVariants: true },
// })
//
// export default theme

// src/ui/theme/index.js

import { createMuiTheme } from '@material-ui/core/styles'

const palette = {
  primary: { main: '#1E88E5' },
  secondary: { main: '#BA68C8' },
}

const typography = { useNextVariants: true }
const themeName = 'Curious Blue Amethyst Dog'

export default createMuiTheme({ palette, typography, themeName })
