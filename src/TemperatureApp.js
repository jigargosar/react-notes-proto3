import React from 'react'
import useProfunctorState from './upf.js'

function fToC(fahrenheit) {
  return Math.round(((fahrenheit - 32) * 5) / 9)
}

function cToF(celsius) {
  return Math.round((celsius * 9) / 5 + 32)
}

function CelsiusThermometer({ state, setState }) {
  const onColder = () => setState(prev => prev - 5)
  const onHotter = () => setState(prev => prev + 5)
  return (
    <div>
      <button onClick={onColder}>Colder</button>
      <button onClick={onHotter}>Hotter</button>
      <input
        value={state}
        type="number"
        onChange={e => setState(Number(e.target.value))}
      />
    </div>
  )
}

function TemperatureApp() {
  const initialState = { fahrenheit: 70, other: {} }
  const { state, setState, promap } = useProfunctorState(initialState)

  const celsiusProf = promap(
    state => fToC(state.fahrenheit),
    (celsius, state) => ({ ...state, fahrenheit: cToF(celsius) }),
  )

  return (
    <div>
      <div>Global app state: {JSON.stringify(state)}</div>
      <CelsiusThermometer {...celsiusProf} />
    </div>
  )
}

export default TemperatureApp