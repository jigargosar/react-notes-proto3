import React, { useEffect, useMemo } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { Inspector } from 'react-inspector'
import {
  createStore,
  StoreProvider,
  useActions,
  useStore,
} from 'easy-peasy'
import useHotKeys from 'react-hotkeys-hook'
import { getCached, setCache } from './dom-helpers'
import { composeWithDevTools } from 'redux-devtools-extension'

import { Portal } from 'react-portal'
import { storeModel } from './store-model'

function InspectState() {
  const { state } = useStore(state => ({
    state,
  }))
  return (
    <PortalInspector
      data={state}
      name={'state'}
      expandPaths={[
        '$',
        '$.todos',
        '$.todos.items',
        '$.notes',
        '$.notes.visibleNotes',
      ]}
    />
  )
}
function PortalInspector(props) {
  const { visible } = useStore(state => ({
    visible: state.debug.inspectorVisible,
  }))

  return (
    visible && (
      <Portal node={document.getElementById('portal-inspector')}>
        <div className="ma2">
          <Inspector {...props} />
        </div>
      </Portal>
    )
  )
}

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

const NotesApp = React.memo(function NotesApp() {
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
})

function useAppStore(storeModel) {
  const store = useMemo(
    () =>
      createStore(storeModel, {
        initialState: getCached('app-state'),
        compose: composeWithDevTools({ trace: true }),
      }),
    [],
  )
  useEffect(() => {
    return store.subscribe(() => {
      setCache('app-state', store.getState())
    })
  }, [])
  return store
}

function App() {
  const store = useAppStore(storeModel)

  useHotKeys('`', () => store.dispatch.debug.toggleInspector())
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
