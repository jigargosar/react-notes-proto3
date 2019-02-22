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
import { autorun, trace } from 'mobx'
import { getCached, setCache } from './dom-helpers'
import validate from 'aproba'

const db = new PouchDB('notes-pdb')

function coreExt(s) {
  validate('O', arguments)
  return {
    views: {
      get snap() {
        return getSnapshot(s)
      },
    },
    actions: {
      autorun(a, b) {
        return addDisposer(s, autorun(a, b))
      },
      applySnap(snap) {
        return applySnapshot(s, snap)
      },
    },
  }
}

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
    notes: t.optional(NotesStore, () => ({ byId: {} })),
    msg: t.optional(t.string, () => 'HW RS'),
  })
  .views(s => ({
    get vn() {
      return pipe([
        R.prop('byId'),
        R.values,
        R.sortWith([R.descend(R.propOr(0, 'modifiedAt'))]),
      ])(s)
    },
  }))
  .extend(coreExt)
  .actions(s => ({
    updateMsgTmp() {
      s.msg = faker.name.lastName()
    },
  }))
  .actions(s => {
    return {
      async onAN() {
        s.updateMsgTmp()
        const note = createNewNote()
        await db.put(note)
      },
      setupLS() {
        try {
          const cached = getCached('rs')
          s.applySnap(cached)
        } catch (e) {
          debugger
        }
        s.autorun(r => {
          trace(r)
          return setCache('rs', s.snap)
        })
      },
    }
  })

// noinspection JSCheckFunctionSignatures
const rs = RootStore.create()

rs.setupLS()

export { rs }

if (module.hot) {
  try {
    const snap = idx(module, _ => _.hot.data.snap)
    if (snap) rs.applySnap(snap)
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
