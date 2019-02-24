import React from 'react'
import { ErrorBoundary } from './comp/ErrorBoundary'
import useHotKeys from 'react-hotkeys-hook'
import { InspectorDialog } from './comp/Inspect'
import { NotesApp } from './comp/NotesApp'
// import MenuIcon from '@material-ui/icons/Menu'
// import More from '@material-ui/icons/MoreVert'

function App({ store }) {
  useHotKeys('`', () => store.dispatch.debug.toggleInspector())

  return (
    <ErrorBoundary>
      <NotesApp />
      <InspectorDialog store={store} />
    </ErrorBoundary>
  )
}

export { App }

if (module.hot) {
  module.hot.dispose(() => {
    console.clear()
  })
}
