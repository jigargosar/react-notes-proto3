import React, { useEffect, useState } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { useActions, useStore } from 'easy-peasy'
import useHotKeys from 'react-hotkeys-hook'
import { PortalInspector, PortalInspectState } from './Inspect'

function NoteItem({ note }) {
  const { remove } = useActions(actions => ({
    remove: actions.notes.remove,
  }))

  return (
    <div className="pa3 bb b--moon-gray flex justify-between ">
      <div className="">{note.content}</div>
      <div>
        <button onClick={() => remove(note)}>X</button>
      </div>
    </div>
  )
}

function NotesApp() {
  const { notes, remoteUrl, syncStatus } = useStore(state => ({
    notes: state.notes.visibleNotes,
    remoteUrl: state.notes.remoteUrl,
    syncStatus: state.notes.syncStatus,
  }))
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
        <button autoFocus onClick={() => add()}>
          ADD
        </button>
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
      {notes.map(note => (
        <NoteItem key={note._id} note={note} />
      ))}
    </>
  )
}

function App({ store }) {
  useHotKeys('`', () => store.dispatch.debug.toggleInspector())

  return (
    <ErrorBoundary>
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
