/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { getCached } from './dom-helpers'
import { useCacheEffect } from './hooks'
import validate from 'aproba'
import * as R from 'ramda'

// function applyIfFunction(fnOrValue, ...args) {
//   validate('*A', [fnOrValue, args])
//   if (R.is(Function)(fnOrValue)) {
//     return R.apply(fnOrValue, args)
//   } else {
//     return fnOrValue
//   }
// }

function useLocalStorage(key, preProcess) {
  validate('SF', arguments)

  const [state, setState] = useState(() => {
    return preProcess(getCached(key))
  })
  useCacheEffect(key, state)
  return [state, setState]
}

function App() {
  const initialState = {}
  const [state, setState] = useLocalStorage(
    'app-state',
    R.pipe(
      R.defaultTo({}),
      R.mergeDeepRight({ ct: 0 }),
    ),
  )

  return (
    state && (
      <div>
        <div>Global app state: {JSON.stringify(state)}</div>
        <div>ct:{state.ct + 1}</div>
      </div>
    )
  )
}

export default App
