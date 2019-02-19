import { useEffect, useMemo } from 'react'
import { createStore } from 'easy-peasy'
import { getCached, setCache } from './dom-helpers'
import { composeWithDevTools } from 'redux-devtools-extension'

export function useAppStore(storeModel, options = {}) {
  const store = useMemo(
    () =>
      createStore(storeModel, {
        initialState: getCached('app-state'),
        compose: composeWithDevTools({ trace: true }),
        ...options,
      }),
    [],
  )
  useEffect(() => {
    return store.subscribe(() => {
      setCache('app-state', store.getState())
    })
  }, [])
  return store
}
