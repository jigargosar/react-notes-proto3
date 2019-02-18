import { useEffect, useState } from 'react'
import { getCached, setCache } from './dom-helpers'
import validate from 'aproba'

export function useCacheEffect(key, notes) {
  useEffect(() => {
    setCache(key, notes)
  }, [notes])
}

export function useLocalStorage(key, preProcess) {
  validate('SF', arguments)

  const [state, setState] = useState(() => {
    return preProcess(getCached(key))
  })
  useCacheEffect(key, state)
  return [state, setState]
}
