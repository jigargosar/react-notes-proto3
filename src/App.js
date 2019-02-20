import React, { useEffect, useState } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { useActions, useStore } from 'easy-peasy'
import useHotKeys from 'react-hotkeys-hook'
import {
  PortalInspector,
  PortalInspectorToolbar,
  PortalInspectState,
} from './Inspect'
import Button from '@material-ui/core/Button'
import { EditDialog } from './EditNoteDialog'

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
  const { visibleNotes, remoteUrl, syncStatus, editNote } = useStore(
    state => {
      const notes = state.notes
      return {
        visibleNotes: notes.visibleNotes,
        remoteUrl: notes.remoteUrl,
        syncStatus: notes.syncStatus,
        editNote: notes.editNote,
      }
    },
  )
  const [ipt, setIpt] = useState(() => remoteUrl || '')
  const { add, setRemoteUrl, startSync } = useActions(actions => ({
    add: actions.notes.addNew,
    setRemoteUrl: actions.notes.setRemoteUrl,
    startSync: actions.notes.startSync,
  }))

  useEffect(() => {
    startSync().catch(console.error)
  }, [remoteUrl])

  return (
    <>
      <div className="ph3 flex items-center">
        <Button variant="outlined" color="primary" onClick={() => add()}>
          ADD
        </Button>
        <div className="flex-grow-1" />
        <form
          className="flex items-center"
          onSubmit={e => {
            e.preventDefault()
            setRemoteUrl(ipt)
          }}
        >
          <label className="flex items-center w-100">
            <div className="mr2">{syncStatus}</div>
            <input
              className="pa1"
              style={{ width: '15rem' }}
              type="text"
              name="remote-couch-url"
              autoComplete="on"
              value={ipt}
              onChange={e => setIpt(e.target.value)}
            />
          </label>
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
