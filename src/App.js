import React, { useEffect, useMemo } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { overProp, pipe } from './ramda-helpers'
import * as R from 'ramda'
import nanoid from 'nanoid'
import faker from 'faker'
import { Inspector, ObjectLabel, ObjectRootLabel } from 'react-inspector'
import {
  createStore,
  select,
  StoreProvider,
  useActions,
  useStore,
} from 'easy-peasy'
import useHotKeys from 'react-hotkeys-hook'
import { getCached, setCache } from './dom-helpers'
import { composeWithDevTools } from 'redux-devtools-extension'

import { Portal } from 'react-portal'
import validate from 'aproba'

function setSelectedId(id) {
  validate('S|Z', arguments)

  return R.assoc('selectedId')(id)
}

function addNewNote(state) {
  const note = {
    _id: `m_${nanoid()}`,
    _rev: null,
    content: faker.lorem.lines(),
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  }
  const id = note._id
  return pipe([R.assocPath(['byId', id])(note), setSelectedId(id)])(state)
}
function removeNote(state, note) {
  return R.dissocPath(['byId', note._id])(state)
}

const defaultNodeRenderer = ({
  depth,
  name,
  data,
  isNonenumerable,
  expanded,
}) => {
  console.log(`data`, data)
  return depth === 0 ? (
    <ObjectRootLabel name={name} data={data} />
  ) : (
    <ObjectLabel
      name={name}
      data={data}
      isNonenumerable={isNonenumerable}
    />
  )
}

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
          <Inspector nodeRenderer={defaultNodeRenderer} {...props} />
        </div>
      </Portal>
    )
  )
}

function NoteItem({ note }) {
  const { remove, setSelectedId } = useActions(actions => ({
    remove: actions.notes.remove,
    setSelectedId: actions.notes.setSelectedId,
  }))

  const selectedId = useStore(R.path(['notes', 'selectedId']))
  const isSelected = selectedId === note._id
  return (
    <div className="pa3 bb b--moon-gray flex justify-between ">
      <label>
        <input
          autoFocus={isSelected}
          className="ma2"
          type="radio"
          name="note-item"
          checked={isSelected}
          onChange={e => {
            const newIsSelected = e.target.checked
            if (newIsSelected) {
              setSelectedId(note._id)
            }
          }}
        />
        {note.content}
      </label>
      <div>
        <button onClick={() => remove(note)}>X</button>
      </div>
    </div>
  )
}

const getVisibleNotes = pipe([
  R.prop('byId'),
  R.values,
  R.sortWith([R.descend(R.propOr(0, 'modifiedAt'))]),
])

function createAppStore() {
  const model = {
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
      selectedId: null,
      visibleNotes: select(getVisibleNotes),
      setSelectedId: (state, payload) => setSelectedId(payload)(state),
      addNew: addNewNote,
      remove: removeNote,
    },
  }
  return createStore(model, {
    initialState: getCached('app-state'),
    compose: composeWithDevTools({ trace: true }),
  })
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

function App() {
  const store = useMemo(() => createAppStore(), [])
  useEffect(() => {
    return store.subscribe(() => {
      setCache('app-state', store.getState())
    })
  }, [])

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
