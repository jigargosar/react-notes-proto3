/* eslint-disable no-unused-vars */
import React from 'react'
import { useLocalStorage } from './hooks'
import { ErrorBoundary } from './ErrorBoundary'
import { mergeDefaults, pipe } from './ramda-helpers'
import * as R from 'ramda'

const getVisibleNotes = pipe([])([
  R.prop('notesById'),
  R.values,
  R.sortWith([R.descend(R.propOr(0, 'modifiedAt'))]),
])

function App() {
  const [state, setState] = useLocalStorage(
    'app-state',
    mergeDefaults({ ct: 0, notesById: {} }),
  )

  const visibleNotes = getVisibleNotes(state)

  return (
    <ErrorBoundary>
      <div>Global app state: {JSON.stringify(state)}</div>
      <div>ct:{state.ct + 1}</div>
      {visibleNotes.map(note => (
        <div className="pa3 bb b--moon-gray">{note.content}</div>
      ))}
    </ErrorBoundary>
  )
}

export default App
