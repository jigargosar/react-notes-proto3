import {
  addDisposer,
  applySnapshot,
  getSnapshot,
  types as t,
} from 'mobx-state-tree'
import faker from 'faker'
import { pipe } from './ramda-helpers'
import * as R from 'ramda'
import nanoid from 'nanoid'
import PouchDB from 'pouchdb-browser'
import idx from 'idx.macro'
import { autorun } from 'mobx'
import { setCache } from './dom-helpers'

const db = new PouchDB('notes-pdb')

const Note = t.model('Note', {
  _id: t.identifier,
  _rev: t.maybeNull(t.string),
  content: t.string,
  createdAt: t.integer,
  modifiedAt: t.integer,
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
      // await db.put(note)
    },
    get vn() {
      return pipe([
        R.prop('byId'),
        R.values,
        R.sortWith([R.descend(R.propOr(0, 'modifiedAt'))]),
      ])(s)
    },
  }))
  .views(s => ({
    get snap() {
      return getSnapshot(s)
    },
  }))
  .actions(s => ({
    addDisposer(d) {
      return addDisposer(s, d)
    },
  }))
  .actions(s => ({
    autorun(a, b) {
      return addDisposer(s, autorun(a, b))
    },
    applySnap(snap) {
      return applySnapshot(s, snap)
    },
  }))
  .actions(s => ({
    setMsg() {
      s.msg = faker.name.lastName()
    },
    setupLS() {
      s.autorun(() => setCache('rs', s.snap))
    },
  }))

const dSnap = { notes: {} }
const rs = RootStore.create(dSnap)

rs.setupLS()

export { rs }

if (module.hot) {
  try {
    rs.applySnap(idx(module, _ => _.hot.data.snap) || dSnap)
  } catch (e) {
    debugger
  }
  module.hot.dispose(data => {
    try {
      data.snap = rs.snap
    } catch (e) {
      debugger
    }
  })
}
