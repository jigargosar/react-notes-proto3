import React, { useEffect, useState } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { useActions, useStore } from 'easy-peasy'
import useHotKeys from 'react-hotkeys-hook'
import { InspectState, PortalInspector } from './Inspect'

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
  const { notes, remoteUrl } = useStore(state => ({
    notes: state.notes.visibleNotes,
    remoteUrl: state.notes.remoteUrl,
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
      <div className="flex justify-between">
        <button autoFocus onClick={() => add()}>
          ADD
        </button>
        <div>
          <form
            onSubmit={e => {
              e.preventDefault()
              setRemoteUrl(ipt)
            }}
          >
            <input
              type="text"
              value={ipt}
              onChange={e => setIpt(e.target.value)}
            />
          </form>
        </div>
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
      <InspectState />
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
