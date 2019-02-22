import {
  addDisposer,
  applySnapshot,
  getSnapshot,
  types as t,
} from 'mobx-state-tree'
import faker from 'faker'
import { dotPath, pipe } from './ramda-helpers'
import * as R from 'ramda'
import nanoid from 'nanoid'
import PouchDB from 'pouchdb-browser'
import { autorun, trace } from 'mobx'
import { getCached, setCache } from './dom-helpers'
import validate from 'aproba'

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
      async onAN() {
        s.updateMsgTmp()
        const note = createNewNote()
        await db.put(note)
      },
    }
  })

// noinspection JSCheckFunctionSignatures
const rs = RootStore.create()

rs.setupLS()

export { rs }

// noinspection JSUnresolvedVariable
if (module.hot) {
  try {
    R.compose(
      R.unless(R.isNil)(rs.applySnap),
      dotPath('hot.data.snap'),
    )(module)
  } catch (e) {
    debugger
  }
  hotDispose(data => void (data.snap = rs.snap))
}

function hotDispose(cb) {
  validate('F', arguments)
  // noinspection JSUnresolvedVariable
  if (module.hot) {
    module.hot.dispose(data => {
      try {
        cb(data)
      } catch (e) {
        debugger
      }
    })
  }
}

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
