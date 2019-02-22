import {
  addDisposer,
  applySnapshot,
  flow as f,
  getSnapshot,
  types as t,
} from 'mobx-state-tree'
import faker from 'faker'
import { dotPath, objFromList, pipe } from './ramda-helpers'
import * as R from 'ramda'
import nanoid from 'nanoid'
import PouchDB from 'pouchdb-browser'
import { autorun, values } from 'mobx'
import { getCached, setCache } from './dom-helpers'
import validate from 'aproba'

const db = new PouchDB('notes-pdb')

function createNewNote() {
  return {
    _id: `m_${nanoid()}`,
    _rev: null,
    content: faker.lorem.lines(),
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  }
}

const Note = t
  .model('Note', {
    _id: t.identifier,
    _rev: t.maybeNull(t.string),
    content: t.string,
    createdAt: t.integer,
    modifiedAt: t.integer,
  })
  .views(s => ({
    get id() {
      return s._id
    },
  }))

const NotesStore = t
  .model('NotesStore', {
    byId: t.map(Note),
  })
  .views(s => ({
    get all() {
      return values(s.byId)
    },
  }))
  .actions(s => ({
    replaceAll(docs) {
      validate('A', arguments)
      s.byId.replace(pouchDocsToIdLookup(docs))
    },
    put(doc) {
      validate('O', arguments)
      s.byId.put(Note.create(doc))
    },
    remove(doc) {
      validate('O', arguments)
      s.byId.delete(Note.create(doc).id)
    },
  }))

const RootStore = t
  .model('RootStore', {
    notes: t.optional(NotesStore, () => ({ byId: {} })),
    msg: t.optional(t.string, () => 'HW RS'),
  })
  .views(s => ({
    get visNotes() {
      return pipe([
        R.prop('notes'),
        R.prop('all'),
        R.sortWith([R.descend(R.propOr(0, 'modifiedAt'))]),
      ])(s)
    },
  }))
  .extend(coreExt)
  .actions(s => ({
    _updateMsgTmp() {
      s.msg = faker.name.lastName()
    },
    _handleChange(change) {
      validate('OZZ', arguments)
      console.debug(`change`, ...arguments)
      const note = change.doc

      change.deleted ? s.notes.remove(note) : s.notes.put(note)
    },
    initCache() {
      try {
        s.applySnap(getCached('rs'))
      } catch (e) {
        console.warn('unable to apply cache snapshot', e)
      }
      s.autorun(() => setCache('rs', s.snap))
      return s
    },
  }))
  .actions(s => {
    return {
      afterCreate() {
        return s.initCache()
      },

      async onAddNewNoteClicked() {
        const note = createNewNote()
        await db.put(note)
        s._updateMsgTmp()
      },
      initPouch: f(function*() {
        const { rows } = yield db.allDocs({
          include_docs: true,
        })
        const docs = rows.map(R.prop('doc'))
        console.log(`docs`, docs)
        s.notes.replaceAll(docs)
        const changes = db
          .changes({
            include_docs: true,
            live: true,
            since: 'now',
          })
          .on('change', s._handleChange)
          .on('error', console.error)
        // actions.startSync()
        return { changes }
      }),
    }
  })

// noinspection JSCheckFunctionSignatures
const rs = RootStore.create()

rs.initPouch().catch(console.error)

export { rs }

// Helpers

function pouchDocsToIdLookup(docs) {
  validate('A', arguments)
  return objFromList(R.prop('_id'))(docs)
}

// BOILER PLATE

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
