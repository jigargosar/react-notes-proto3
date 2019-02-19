import * as R from 'ramda'
import nanoid from 'nanoid'
import faker from 'faker'
import { objFromList, overProp, pipe } from './ramda-helpers'
import { select, thunk } from 'easy-peasy'
import validate from 'aproba'
import PouchDB from 'pouchdb-browser'

const db = new PouchDB('notes-pdb')
let sync = null

function cancelSync() {
  if (sync) {
    sync.cancel()
    sync = null
  }
}

if (module.hot) {
  module.hot.dispose(() => {
    db.close()
  })
}

function createNewNote() {
  return {
    _id: `m_${nanoid()}`,
    _rev: null,
    content: faker.lorem.lines(),
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  }
}

const getVisibleNotes = pipe([
  R.prop('byId'),
  R.values,
  R.sortWith([R.descend(R.propOr(0, 'modifiedAt'))]),
])

function setLookupFromDocs(docs) {
  validate('A', arguments)
  return R.assoc('byId')(pouchDocsToIdLookup(docs))
}

const notesModel = {
  byId: {},
  selectedId: null,
  visibleNotes: select(getVisibleNotes),
  remoteUrl: null,
  syncErr: null,
  syncLastUpdate: null,
  syncDetails: select(state => {
    return { ...(state.syncLastUpdate || {}), err: state.syncErr }
  }),
  syncStatus: select(state => {
    const { syncDetails: push } = state
    if (push) {
      const mapping = {
        pending: 'synced',
        stopped: 'problem',
        active: 'syncing',
      }
    } else {
      return 'disabled'
    }
  }),
  setRemoteUrl: (state, remoteUrl) => {
    return R.assoc('remoteUrl')(remoteUrl)(state)
  },
  add: (state, note) =>
    pipe([R.assocPath(['byId', note._id])(note)])(state),
  addNew: thunk(async (actions, payload) => {
    const note = createNewNote()
    await db.put(note)
  }),
  remove: thunk(async (actions, note) => {
    await db.put({ ...note, _deleted: true })
  }),
  replaceAll: (state, docs) => setLookupFromDocs(docs)(state),
  handleChange: (state, change) => {
    console.log(`change`, change)
    const note = change.doc
    const mergeNote = R.assocPath(['byId', note._id])(note)
    const omitNote = R.dissocPath(['byId', note._id])

    const update = change.deleted ? omitNote : mergeNote
    return update(state)
  },
  initFromPouch: thunk(async (actions, payload, { getState }) => {
    const { rows } = await db.allDocs({ include_docs: true })
    const docs = rows.map(R.prop('doc'))
    actions.replaceAll(docs)
    const changes = db
      .changes({ include_docs: true, live: true, since: 'now' })
      .on('change', actions.handleChange)
      .on('error', console.error)
    return { changes }
  }),

  syncUpdate: (state, _info) => {
    console.log('syncUpdate', _info, sync)
    const syncState = sync
      ? {
          push: R.path(['push', 'state'])(sync),
        }
      : {}
    return R.assoc('syncLastUpdate')({ ...syncState, _info })(state)
  },
  syncError: (state, err) => {
    console.error('syncError', err)
    return R.assoc('syncError')(err.message)(state)
  },
  clearSync: state => {
    cancelSync()
    const update = pipe([
      R.assoc('syncError')(null),
      R.assoc('syncLastUpdate')(null),
    ])
    return update(state)
  },
  startSync: thunk(async (actions, payload, { getState }) => {
    actions.clearSync()
    const remoteUrl = getState().notes.remoteUrl
    console.log(`remoteUrl`, remoteUrl)
    if (remoteUrl) {
      try {
        sync = db
          .sync(new PouchDB(remoteUrl, { adapter: 'http' }), {
            live: true,
            retry: true,
          })
          .on('change', actions.syncUpdate)
          .on('paused', actions.syncUpdate)
          .on('active', actions.syncUpdate)
          .on('complete', actions.syncUpdate)
          .on('denied', actions.syncUpdate)
          .on('error', (...args) => actions.syncError(args))
      } catch (e) {
        debugger
        actions.syncError(e)
      }
    }
  }),
}

export const storeModel = {
  debug: {
    inspectorVisible: true,
    toggleInspector: state => overProp('inspectorVisible')(R.not)(state),
  },
  todos: {
    items: ['Install easy-peasy', 'Build app', 'Profit'],
    // 👇 define actions directly on your model
    add: (state, payload) => {
      // do simple mutation to update state, and we make it an immutable update
      state.items.push(payload)
      // (you can also return a new immutable instance if you prefer)
    },
  },
  notes: notesModel,
}

function pouchDocsToIdLookup(docs) {
  validate('A', arguments)
  return objFromList(R.prop('_id'))(docs)
}
