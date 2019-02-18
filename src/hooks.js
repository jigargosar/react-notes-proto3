import { useEffect } from 'react'
import { setCache } from './dom-helpers'

export function useCacheEffect(key, notes) {
  useEffect(() => {
    setCache(key, notes)
  }, [notes])
}
