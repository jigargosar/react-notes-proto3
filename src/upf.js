import { createElement, useMemo, useState } from 'react'

export class ProfunctorState {
  constructor(state, setState) {
    this.state = state
    this.setState = setState
  }

  promap(a, b, c) {
    const get = typeof a === 'object' ? a.get : a
    const set = typeof a === 'object' ? a.set : b
    const args = typeof a === 'object' ? b : c

    const innerSetState = newInnerStateOrUpdate => {
      this.setState(prevState => {
        const innerState = get(prevState)
        const newInnerState =
          typeof newInnerStateOrUpdate === 'function'
            ? newInnerStateOrUpdate(innerState)
            : newInnerStateOrUpdate
        if (newInnerState === innerState) return prevState
        return set(newInnerState, prevState)
      })
    }

    const innerState = get(this.state)
    return useMemoizedProfunctorState(innerState, innerSetState, args)
  }
}

function useMemoizedProfunctorState(state, setState, args) {
  return useMemo(
    () => {
      const profunctor = new ProfunctorState(state, setState)
      profunctor.promap = profunctor.promap.bind(profunctor)
      return profunctor
    },
    args ? args : [state],
  )
}

export function useProfunctorState(initial, args) {
  const [state, setState] = useState(initial)
  return useMemoizedProfunctorState(state, setState, args)
}

export function withProfunctorState(Component, initial, args) {
  function WPS() {
    const prof = useProfunctorState(initial, args)
    return createElement(Component, prof)
  }
  WPS.displayName =
    'WithProfunctorState(' +
    (Component.displayName || Component.name || 'Component') +
    ')'
  return WPS
}

export default useProfunctorState
