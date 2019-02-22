import {
  applySnapshot as ap,
  getSnapshot as snap,
  types as t,
} from 'mobx-state-tree'

const Note = t.model('Note', {
  _id: t.identifier,
})

const NotesStore = t.model('NotesStore', {
  byId: t.map(Note),
})

const RootStore = t.model('RootStore', {
  notes: NotesStore,
})

const iSnap = { notes: {} }
const store = RootStore.create(iSnap)

snap(store) //?

export { store }

if (module.hot) {
  ap(store, module.hot.data || iSnap)
  module.hot.dispose(data => (data.snap = snap(store)))
}
