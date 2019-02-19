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

function addNewNote(state) {
  const note = {
    _id: `m_${nanoid()}`,
    _rev: null,
    content: faker.lorem.lines(),
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  }
  return R.assocPath(['byId', note._id])(note)(state)
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
  const remove = useActions(actions => actions.notes.remove)
  return (
    <div className="pa3 bb b--moon-gray flex justify-between ">
      <div>{note.content}</div>
      <div>
        <button onClick={() => remove(note)}>XX</button>
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
      visibleNotes: select(getVisibleNotes),
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
        <PortalInspector data={{ foo: 1 }} />
        <PortalInspector
          data={store}
          name={'store'}
          expandPaths={[
            '$',
            '$.todos',
            '$.todos.items',
            '$.notes',
            '$.notes.visibleNotes',
          ]}
        />
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
