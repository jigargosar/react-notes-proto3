import React, { useEffect, useState } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { useActions } from 'easy-peasy'
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

function NoteItem({ note }) {
  const { remove, startEditing } = useActions(actions => ({
    remove: actions.notes.remove,
    startEditing: actions.notes.startEditing,
  }))

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
            autoFocus
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

function App({ store }) {
  useHotKeys('`', () => store.dispatch.debug.toggleInspector())

  return (
    <ErrorBoundary>
      <PortalInspectorToolbar />
      <PortalInspectState />
      <PortalInspector data={store} name={'store'} />
      <NotesApp />
    </ErrorBoundary>
  )
}

export { App }

if (module.hot) {
  module.hot.dispose(() => {
    console.clear()
  })
}
