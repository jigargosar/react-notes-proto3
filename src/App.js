/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { getCached } from './dom-helpers'
import { useCacheEffect } from './hooks'

function App() {
  const initialState = { fahrenheit: 70, other: {} }

  const [state, setState] = useState(() => getCached('app-state') || {})
  useCacheEffect('app-state', state)

  return (
    <div>
      <div>Global app state: {JSON.stringify(state)}</div>
    </div>
  )
}

export default App
