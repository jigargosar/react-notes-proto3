import {
  applySnapshot as ap,
  destroy,
  getSnapshot as snap,
  types as t,
} from 'mobx-state-tree'
import faker from 'faker'
import { pipe } from './ramda-helpers'
import * as R from 'ramda'
import nanoid from 'nanoid'
import validate from 'aproba'
import PouchDB from 'pouchdb-browser'

const db = new PouchDB('notes-pdb')
// hotDispose(() => db.close())

const Note = t.model('Note', {
  _id: t.identifier,
  _rev: t.maybeNull(t.string),
  content: t.string,
})

function createNewNote() {
  return {
    _id: `m_${nanoid()}`,
    _rev: null,
    content: faker.lorem.lines(),
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  }
}

const NotesStore = t.model('NotesStore', {
  byId: t.map(Note),
})

const RootStore = t
  .model('RootStore', {
    notes: NotesStore,
    msg: 'HW RS',
  })
  .views(s => ({
    async onAN() {
      const note = createNewNote()
      await db.put(note)
    },
    get vn() {
      return pipe([
        R.prop('byId'),
        R.values,
        R.sortWith([R.descend(R.propOr(0, 'modifiedAt'))]),
      ])(s)
    },
  }))
  .actions(s => ({
    onBeforeDestroy() {
      alert('destroy')
    },
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
  hotDispose(data => {
    data.snap = snap(rs)
  })
}

function hotDispose(cb) {
  validate('F', arguments)
  if (module.hot) {
    module.hot.dispose(data => {
      try {
        cb(data)
      } catch (e) {
        console.error(e)
      }
    })
  }
}
