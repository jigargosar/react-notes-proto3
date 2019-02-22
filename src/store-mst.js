import {
  applySnapshot as ap,
  getSnapshot as snap,
  types as t,
} from 'mobx-state-tree'
import faker from 'faker'

const Note = t.model('Note', {
  _id: t.identifier,
})

const NotesStore = t.model('NotesStore', {
  byId: t.map(Note),
})

const RootStore = t
  .model('RootStore', {
    notes: NotesStore,
    msg: 'HW RS',
  })
  .actions(s => ({
    setMsg() {
      s.msg = faker.name.lastName()
    },
  }))

const iSnap = { notes: {} }
const rs = RootStore.create(iSnap)

snap(rs) //?

export { rs }

if (module.hot) {
  ap(rs, module.hot.data || iSnap)
  module.hot.dispose(data => (data.snap = snap(rs)))
}
