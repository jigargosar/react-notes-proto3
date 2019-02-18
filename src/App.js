/* eslint-disable no-unused-vars */
import React from 'react'
import { useLocalStorage } from './hooks'
import { ErrorBoundary } from './ErrorBoundary'
import { mergeDefaults, overProp, pipe } from './ramda-helpers'
import * as R from 'ramda'
import nanoid from 'nanoid'
import faker from 'faker'
import { Inspector } from 'react-inspector'
import validate from 'aproba'
import useHotKeys from 'react-hotkeys-hook'
import {
  createStore,
  select,
  StoreProvider,
  useActions,
  useStore,
} from 'easy-peasy'

const getVisibleNotes = pipe([
  R.prop('notesById'),
  R.values,
  R.sortWith([R.descend(R.propOr(0, 'modifiedAt'))]),
])

function addNewNote(setState) {
  const note = {
    _id: `m_${nanoid()}`,
    _rev: null,
    content: faker.lorem.lines(),
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  }
  const overNotesById = overProp('notesById')
  setState(overNotesById(R.mergeLeft(R.objOf(note._id, note))))
}

const ivLens = R.lensPath(['__debug', 'inspectorVisible'])

function isInspectorVisible(state) {
  validate('O', arguments)
  return R.view(ivLens)(state)
}

function useAppState(def) {
  validate('O', arguments)
  const [state, setState] = useLocalStorage(
    'app-state',
    mergeDefaults({ ...def, __debug: { inspectorVisible: false } }),
  )

  // useHotKeys('`', () => setState(toggleLens(ivLens)))

  return [state, setState]
}

function InspectState({ state }) {
  return (
    isInspectorVisible(state) && (
      <div className="mv3">
        <Inspector data={state} name={'app-state'} />
      </div>
    )
  )
}

function InspectState2() {
  const { state, visible } = useStore(state => ({
    visible: state.debug.inspectorVisible,
    state,
  }))
  const toggle = useActions(actions => actions.debug.toggleInspector)

  useHotKeys('`', () => {
    debugger
    return toggle()
  })

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
    toggleInspector: overProp('inspectorVisible')(R.not),
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
    getVisibleNotes: select(
      pipe([
        R.prop('byId'),
        R.values,
        R.sortWith([R.descend(R.propOr(0, 'modifiedAt'))]),
      ]),
    ),
  },
})

function App() {
  const [state, setState] = useAppState({ ct: 0, notesById: {} })

  const visibleNotes = getVisibleNotes(state)

  return (
    <ErrorBoundary>
      <StoreProvider store={store}>
        <InspectState2 />
      </StoreProvider>
      <InspectState state={state} />
      {/*<Inspector data={visibleNotes} table />*/}
      <div className="flex">
        <button autoFocus onClick={() => addNewNote(setState)}>
          ADD
        </button>
      </div>
      {visibleNotes.map(note => (
        <NoteItem key={note._id} note={note} />
      ))}
    </ErrorBoundary>
  )
}

export default App

if (module.hot) {
  module.hot.dispose(() => {
    console.clear()
  })
}
