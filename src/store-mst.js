import {
  addDisposer,
  applySnapshot,
  flow as f,
  getSnapshot,
  types as t,
} from 'mobx-state-tree'
import faker from 'faker'
import { dotPath, objFromList } from './ramda-helpers'
import * as R from 'ramda'
import nanoid from 'nanoid'
import PouchDB from 'pouchdb-browser'
import { autorun, values } from 'mobx'
import { getCached, setCache } from './dom-helpers'
import validate from 'aproba'
import { it } from 'param.macro'

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

function initPouchNotes(s) {
  return function*() {
    const { rows } = yield db.allDocs({
      include_docs: true,
    })
    const docs = rows.map(it.doc)
    console.log(`docs`, docs)
    s.replaceAll(docs)
    const changes = db
      .changes({
        include_docs: true,
        live: true,
        since: 'now',
      })
      .on('change', s._handleChange)
      .on('error', console.error)
    s._startSync()
    return { changes }
  }
}

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
      s.byId.delete(doc._id)
    },
  }))
  .actions(s => ({
    _handleChange(change) {
      validate('OZZ', arguments)
      console.debug(`change`, ...arguments)
      const doc = change.doc

      change.deleted ? s.remove(doc) : s.put(doc)
    },
    initPouch: f(initPouchNotes(s)),
  }))
  .props({
    remoteUrl: '',
  })
  .volatile(() => {
    let sync = null
    let lastSyncUpdate = null
    let syncError = null
    return {
      get sync() {
        return sync
      },
      set sync(val) {
        sync = val
      },
      get lastSyncUpdate() {
        return lastSyncUpdate
      },
      set lastSyncUpdate(val) {
        lastSyncUpdate = val
      },
      get syncError() {
        return syncError
      },
      set syncError(val) {
        syncError = val
      },
    }
  })
  .views(s => ({
    get syncStatus() {
      const mapping = {
        pending: 'synced',
        stopped: 'problem',
        active: 'syncing',
      }
      return R.propOr('disabled', (s.lastSyncUpdate || {}).push)(mapping)
    },
  }))
  .actions(s => ({
    _updateSyncState(info) {
      const sync = s.sync
      console.debug('_updateSyncState', info, sync)
      const lastSyncUpdate = sync
        ? {
            push: R.path(['push', 'state'])(sync),
            pull: R.path(['pull', 'state'])(sync),
          }
        : {}
      s.lastSyncUpdate = { ...lastSyncUpdate, info }
    },
    _updateSyncError(err) {
      console.error('syncError', err)
      s.syncError = err
    },
    _startSync() {
      if (s.sync) {
        s.sync.cancel()
      }
      const remoteUrl = s.remoteUrl
      // const remoteUrl = 'http://127.0.0.1:5984/np3'
      if (remoteUrl) {
        try {
          s.sync = db
            .sync(new PouchDB(remoteUrl, { adapter: 'http' }), {
              live: true,
              retry: true,
            })
            .on('change', s._updateSyncState)
            .on('paused', s._updateSyncState)
            .on('active', s._updateSyncState)
            .on('complete', s._updateSyncState)
            .on('denied', s._updateSyncState)
            .on('error', s._updateSyncError)
        } catch (e) {
          debugger
          s._updateSyncError(e)
        }
      }
    },
  }))

const RootStore = t
  .model('RootStore', {
    notes: t.optional(NotesStore, () => ({ byId: {} })),
    msg: t.optional(t.string, () => 'HW RS'),
  })
  .views(s => ({
    get visNotes() {
      return R.sortWith([R.descend(R.propOr(0, 'modifiedAt'))])(
        s.notes.all,
      )
    },
  }))
  .extend(coreExt)
  .actions(s => ({
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
      initPouch() {
        return s.notes.initPouch()
      },
      async addNewNoteClicked() {
        const note = createNewNote()
        await db.put(note)
        s._updateMsgTmp()
      },
    }
  })
  .props({
    isSettingsDialogOpen: false,
    settingsDialogRemoteUrl: '',
  })
  .actions(s => ({
    _closeSettingsDialog() {
      s.isSettingsDialogOpen = false
    },
  }))
  .actions(s => ({
    openSettingsDialogClicked() {
      s.isSettingsDialogOpen = true
      s.settingsDialogRemoteUrl = s.notes.remoteUrl
    },
    settingsDialogOnClose() {
      s._closeSettingsDialog()
    },
    onSettingsDialogRemoteUrlChange(e) {
      s.settingsDialogRemoteUrl = e.target.value
    },
    onSettingsDialogSaveClicked() {
      s.notes.remoteUrl = s.settingsDialogRemoteUrl
      s._closeSettingsDialog()
    },
    onSettingsDialogDiscardClicked() {
      s._closeSettingsDialog()
    },
  }))

// noinspection JSCheckFunctionSignatures
const rs = RootStore.create()
if (process.env.NODE_ENV !== 'production') {
  window.rs = rs
}

rs.initPouch().catch(console.error)

export { rs }

// Helpers

function pouchDocsToIdLookup(docs) {
  validate('A', arguments)
  return objFromList(it._id)(docs)
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
  hotDispose(data => {
    data.snap = rs.snap
    const sync = rs.notes.sync
    if (sync) {
      sync.cancel()
    }
  })
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
