/* eslint-disable no-unused-vars */
import React from 'react'
import { useLocalStorage } from './hooks'
import { ErrorBoundary } from './ErrorBoundary'
import { mergeDefaults } from './ramda-helpers'

function App() {
  const initialState = {}
  const [state, setState] = useLocalStorage('app-state', mergeDefaults)

  return (
    <ErrorBoundary>
      <div>Global app state: {JSON.stringify(state)}</div>
      <div>ct:{state.ct + 1}</div>
    </ErrorBoundary>
  )
}

export default App
