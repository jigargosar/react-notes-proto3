import React, { useEffect } from 'react'
import { ErrorBoundary } from './comp/ErrorBoundary'
import useHotKeys from 'react-hotkeys-hook'
import { InspectorDialog } from './comp/Inspect'
import { EditDialog } from './comp/EditNoteDialog'
import { useNotes, useNotesActions } from './store-model'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import { withStyles } from '@material-ui/core/styles'
// import MenuIcon from '@material-ui/icons/Menu'
// import More from '@material-ui/icons/MoreVert'
import { SettingsDialog } from './comp/SettingsDialog'
import { NoteList } from './comp/NoteList'
import { TopAppBar } from './comp/TopAppBar'

function NotesApp() {
  const { remoteUrl, editNote } = useNotes()

  const { startSync } = useNotesActions()

  useEffect(() => {
    startSync().catch(console.error)
  }, [remoteUrl])

  return (
    <div className="pb5">
      <TopAppBar />
      <NoteList />
      {editNote && <EditDialog note={editNote} />}
      <SettingsDialog />
      <AddNoteFab />
    </div>
  )
}

const AddNoteFab = withStyles({
  root: {
    position: 'fixed',
  },
})(function AddNoteFab({ classes, ...otherProps }) {
  const { addNew } = useNotesActions()
  return (
    <Fab
      className={`absolute bottom-1 right-1 ${classes.root}`}
      size="small"
      color="secondary"
      onClick={() => addNew()}
      {...otherProps}
    >
      <AddIcon />
    </Fab>
  )
})

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
