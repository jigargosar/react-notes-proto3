import React, { useDebugValue } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { _idProp, objBy, overById, overProp, pipe } from './ramda-helpers'
import * as R from 'ramda'
import nanoid from 'nanoid'
import faker from 'faker'
import { Inspector } from 'react-inspector'
import {
  createStore,
  select,
  StoreProvider,
  useActions,
  useStore,
} from 'easy-peasy'
import useHotKeys from 'react-hotkeys-hook'

function addNewNote(state) {
  const note = {
    _id: `m_${nanoid()}`,
    _rev: null,
    content: faker.lorem.lines(),
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  }
  return overById(R.mergeLeft(objBy(_idProp, note)))(state)
}

function useDebugStore(arg) {
  useDebugValue('useDebugStore')

  const ret = useStore(arg)
  useDebugValue('useDebugStore')
  return ret
}

function InspectState() {
  const { visible, state } = useDebugStore(state => ({
    visible: state.debug.inspectorVisible,
    state,
  }))

  return (
    visible && (
      <div className="mv3">
        <Inspector data={state} name={'app-state'} />
      </div>
    )
  )
}

function NoteItem(props) {
  return <div className="pa3 bb b--moon-gray">{props.note.content}</div>
}

const store = createStore({
  debug: {
    inspectorVisible: true,
    toggleInspector: state => overProp('inspectorVisible')(R.not)(state),
  },
  todos: {
    items: ['Install easy-peasy', 'Build app', 'Profit'],
    // 👇 define actions directly on your model
    add: (state, payload) => {
      // do simple mutation to update state, and we make it an immutable update
      state.items.push(payload)
      // (you can also return a new immutable instance if you prefer)
    },
  },
  notes: {
    byId: {},
    visibleNotes: select(
      pipe([
        R.prop('byId'),
        R.values,
        R.sortWith([R.descend(R.propOr(0, 'modifiedAt'))]),
      ]),
    ),
    addNewNote,
  },
})

const NotesApp = React.memo(function NotesApp() {
  const visibleNotes = useDebugStore(state => state.notes.visibleNotes)
  const add = useActions(actions => actions.notes.addNewNote)
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

function App() {
  useHotKeys('`', () => store.dispatch.debug.toggleInspector())
  return (
    <ErrorBoundary>
      <StoreProvider store={store}>
        <InspectState />
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
