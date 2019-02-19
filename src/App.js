import React, { useEffect } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import {
  createStore,
  StoreProvider,
  useActions,
  useStore,
} from 'easy-peasy'
import useHotKeys from 'react-hotkeys-hook'
import { storeModel } from './store-model'
import { InspectState, PortalInspector } from './Inspect'
import { getCached, setCache } from './dom-helpers'
import { composeWithDevTools } from 'redux-devtools-extension'

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
  const visibleNotes = useStore(state => state.notes.visibleNotes)
  const add = useActions(actions => actions.notes.addNew)
  return (
    <>
      <div className="flex">
        <button autoFocus onClick={() => add()}>
          ADD
        </button>
      </div>
      {visibleNotes.map(note => (
        <NoteItem key={note._id} note={note} />
      ))}
    </>
  )
}

const store = createStore(storeModel, {
  initialState: getCached('app-state'),
  compose: composeWithDevTools({ trace: true }),
})

function App() {
  useEffect(
    () => store.subscribe(() => setCache('app-state', store.getState())),
    [],
  )

  useHotKeys('`', () => store.dispatch.debug.toggleInspector())

  useEffect(() => {
    const initResult = store.dispatch.notes.initFromPouch()
    initResult.catch(console.error)
    return () => {
      initResult
        .then(({ changes, sync }) => {
          if (sync) {
            sync.cancel()
          }
          changes.cancel()
        })
        .catch(console.error)
    }
  }, [])

  return (
    <ErrorBoundary>
      <StoreProvider store={store}>
        <InspectState />
        <PortalInspector data={store} name={'store'} />
        <NotesApp />
      </StoreProvider>
    </ErrorBoundary>
  )
}

export { App }

if (module.hot) {
  module.hot.dispose(() => {
    console.clear()
  })
}
