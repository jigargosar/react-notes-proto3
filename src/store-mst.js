import {
  addDisposer,
  applySnapshot,
  clone as cloneNode,
  getRoot,
  getSnapshot,
  types as t,
} from 'mobx-state-tree'
import faker from 'faker'
import { dotPath } from './ramda-helpers'
import * as R from 'ramda'
import nanoid from 'nanoid'
import PouchDB from 'pouchdb-browser'
import { autorun } from 'mobx'
import { getCached, setCache } from './dom-helpers'
import validate from 'aproba'
import { createPouchStore } from './PouchDocStore'

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

const NotesStore = createPouchStore(Note, s =>
  s
    .props({
      remoteUrl: '',
    })
    .volatile(() => {
      let syncRef = null
      let lastSyncUpdate = null
      let syncError = null
      return {
        get syncRef() {
          return syncRef
        },
        set syncRef(val) {
          if (syncRef) {
            syncRef.cancel()
          }
          syncRef = val
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
        const sync = s.syncRef
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
    }))
    .actions(s => ({
      _startSync() {
        if (s.syncRef) {
          s.syncRef.cancel()
        }
        const remoteUrl = s.remoteUrl
        // const remoteUrl = 'http://127.0.0.1:5984/np3'
        if (remoteUrl) {
          try {
            s.syncRef = db
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
    })),
)

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
      init() {
        s.initCache()
        s.notes.initPouch(db)
        s.notes._startSync()
      },
      async addNewNoteClicked() {
        const note = createNewNote()
        await db.put(note)
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
  .props({
    isEditNoteDialogOpen: false,
    editingNoteContent: '',
    editingNote: t.maybeNull(Note),
  })
  .actions(s => ({
    _closeEditingNoteDialog() {
      s.isEditNoteDialogOpen = false
    },
  }))
  .actions(s => ({
    startEditingNote(_note) {
      const note = s.notes.byId.get(_note._id)
      s.isEditNoteDialogOpen = true
      s.editingNoteContent = note.content
      s.editingNote = cloneNode(note)
    },
    editNoteDialogOnClose() {
      s._closeEditingNoteDialog()
    },
    onEditingNoteContentChanged(e) {
      s.editingNoteContent = e.target.value
    },
    onEditNoteDialogSaveClicked() {
      s._closeEditingNoteDialog()
    },
    onEditNoteDialogDiscardClicked() {
      s._closeEditingNoteDialog()
    },
    onEditNoteDialogDeleteClicked() {
      s._closeEditingNoteDialog()
    },
  }))

// noinspection JSCheckFunctionSignatures
const rs = RootStore.create()
if (process.env.NODE_ENV !== 'production') {
  window.rs = rs
}

rs.init()

export { rs }

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
      get root() {
        getRoot(s)
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
