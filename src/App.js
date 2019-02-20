import React, { useEffect, useState } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import useHotKeys from 'react-hotkeys-hook'
import {
  PortalInspector,
  PortalInspectorToolbar,
  PortalInspectState,
} from './Inspect'
import Button from '@material-ui/core/Button'
import { EditDialog } from './EditNoteDialog'
import { useNoteActions, useNotes } from './store-model'
import TextField from '@material-ui/core/TextField'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import { withStyles } from '@material-ui/core/styles'

function NoteItem({ note }) {
  const { remove, startEditing } = useNoteActions()

  return (
    <div className="pa3 bb b--moon-gray flex justify-between ">
      <div className="flex-auto" onClick={() => startEditing(note)}>
        {note.content}
      </div>
      <div>
        <button onClick={() => remove(note)}>X</button>
      </div>
    </div>
  )
}

function NotesApp() {
  const { visibleNotes, remoteUrl, syncStatus, editNote } = useNotes()
  const [ipt, setIpt] = useState(() => remoteUrl || '')
  const { addNew, setRemoteUrl, startSync } = useNoteActions()

  useEffect(() => {
    startSync().catch(console.error)
  }, [remoteUrl])

  return (
    <>
      <div className="ph3 flex items-center">
        <Button
          variant="outlined"
          color="primary"
          onClick={() => addNew()}
        >
          ADD
        </Button>
        <div className="flex-grow-1" />
        <div className="mh2">{syncStatus}</div>
        <div className="mh2">{remoteUrl}</div>
        <form
          className="flex items-center"
          onSubmit={e => {
            e.preventDefault()
            setRemoteUrl(ipt)
          }}
        >
          <TextField
            label="CouchDB URL"
            value={ipt}
            onChange={e => setIpt(e.target.value)}
            name="remote-couch-url"
            margin="normal"
            fullWidth
            variant="outlined"
          />
        </form>
      </div>
      {visibleNotes.map(note => (
        <NoteItem key={note._id} note={note} />
      ))}
      {editNote && <EditDialog note={editNote} />}
    </>
  )
}

const AddNoteFab = withStyles({
  root: {
    position: 'absolute',
  },
})(function AddNoteFab({ classes, ...otherProps }) {
  const { addNew } = useNoteActions()
  return (
    <Fab
      className={`absolute bottom-1 right-1 ${classes.root}`}
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
      <PortalInspectorToolbar />
      <PortalInspectState />
      <PortalInspector data={store} name={'store'} />
      <NotesApp />
      <AddNoteFab />
    </ErrorBoundary>
  )
}

export { App }

if (module.hot) {
  module.hot.dispose(() => {
    console.clear()
  })
}
