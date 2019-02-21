import { createStore } from 'easy-peasy'
import { storeModel } from './store-model'
import { getCached, setCache } from './dom-helpers'
import { composeWithDevTools } from 'redux-devtools-extension'

export const store = createStore(storeModel, {
  initialState: getCached('app-state'),
  compose: composeWithDevTools({ trace: true }),
})

store.subscribe(() => setCache('app-state', store.getState()))

store.dispatch.notes.initPouch().catch(console.error)
