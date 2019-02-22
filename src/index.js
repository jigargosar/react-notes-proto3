import './pre-boot'
import React from 'react'
import 'tachyons'
import './index.scss'
import * as serviceWorker from './serviceWorker'
import * as ReactDOM from 'react-dom'
import { App } from './App'
import { store } from './store'
import { StoreProvider } from 'easy-peasy'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import theme from './ui/theme'
import JssProvider from 'react-jss/lib/JssProvider'
import { generateClassName, jss } from './ui/jss'

function render() {
  ReactDOM.render(
    <JssProvider jss={jss} generateClassName={generateClassName}>
      <MuiThemeProvider theme={theme}>
        <StoreProvider store={store}>
          <App store={store} />
        </StoreProvider>
      </MuiThemeProvider>
    </JssProvider>,
    document.getElementById('root'),
  )
}

render()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()

if (module.hot) {
  module.hot.accept(['./App'], render)
}
