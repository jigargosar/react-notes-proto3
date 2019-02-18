/* eslint-disable no-unused-vars */
import React, { useState } from 'react'

function App() {
  const initialState = { fahrenheit: 70, other: {} }

  const [state, set] = useState(initialState)

  return (
    <div>
      <div>Global app state: {JSON.stringify(state)}</div>
    </div>
  )
}

export default App
