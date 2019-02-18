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

function NoteItem(props) {
  return <div className="pa3 bb b--moon-gray">{props.note.content}</div>
}

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

function useAppState(def) {
  validate('O', arguments)
  const [state, setState] = useLocalStorage(
    'app-state',
    mergeDefaults({ ct: 0, notesById: {} }),
  )
  return [state, setState]
}

function App() {
  const [state, setState] = useAppState({ ct: 0, notesById: {} })

  const visibleNotes = getVisibleNotes(state)

  return (
    <ErrorBoundary>
      <Inspector data={state} name={'app-state'} />
      <div className="mv3">
        {/*<Inspector data={visibleNotes} table />*/}
      </div>
      <div>ct:{state.ct + 1}</div>
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
