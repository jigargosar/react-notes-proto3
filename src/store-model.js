import * as R from 'ramda'
import {
  _idProp,
  isNotNil,
  objFromList,
  overProp,
  pipe,
} from './ramda-helpers'
import validate from 'aproba'
import nanoid from 'nanoid'
import faker from 'faker'
import { select, thunk, useActions, useStore } from 'easy-peasy'
import PouchDB from 'pouchdb-browser'

const db = new PouchDB('notes-pdb')

let sync = null

function cancelSync() {
  if (sync) {
    sync.cancel()
    sync = null
  }
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

export const notesModel = {
  byId: {},
  selectedIdDict: {},
  selectAll: state => {
    const visibleNoteIds = state.visibleNotes.map(_idProp)
    return R.assoc('selectedIdDict')(
      R.zipObj(visibleNoteIds, R.repeat(true)(visibleNoteIds.length)),
    )(state)
  },
  selectedNotes: select(state => {
    return pipe([
      R.prop('selectedIdDict'),
      R.filter(R.identity),
      R.keys,
      R.map(R.prop(R.__, state.byId)),
      R.filter(isNotNil),
    ])(state)
  }),
  deleteAllSelected: thunk(async (actions, payload, { getState }) => {
    const selectedNotes = getState().notes.selectedNotes
    debugger
    await Promise.all(selectedNotes.map(actions.removeNote))
    actions.clearSelection()
  }),
  clearSelection: R.assoc('selectedIdDict')({}),
  setNoteSelected: (state, { selected, note }) =>
    R.assocPath(['selectedIdDict', note._id])(selected)(state),
  visibleNotes: select(getVisibleNotes),
  remoteUrl: null,
  syncErr: null,
  syncLastUpdate: null,
  isSettingsDialogOpen: false,
  openSettingsDialog: R.assoc('isSettingsDialogOpen', true),
  closeSettingsDialog: R.assoc('isSettingsDialogOpen', false),

  editNote: null,
  closeEditDialog: R.assoc('editNote', null),
  deleteEditingNote: thunk(async (actions, content, { getState }) => {
    const editNote = getState().notes.editNote
    await db.put({
      ...editNote,
      _deleted: true,
      modifiedAt: Date.now(),
    })
    actions.closeEditDialog()
  }),
  saveEditingNoteContent: thunk(async (actions, content, { getState }) => {
    const editNote = getState().notes.editNote
    const pdbNote = await db.get(editNote._id)
    await db.put({
      ...pdbNote,
      content,
      _rev: editNote._rev,
      modifiedAt: Date.now(),
    })
    actions.closeEditDialog()
  }),
  isEditingNote: select(pipe([R.prop('editNote'), isNotNil])),
  startEditing: (state, note) => pipe([R.assoc('editNote')(note)])(state),
  syncStatus: select(state => {
    const mapping = {
      pending: 'synced',
      stopped: 'problem',
      active: 'syncing',
    }
    return R.propOr('disabled', (state.syncLastUpdate || {}).push)(mapping)
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
  removeNote: thunk(async (actions, note) => {
    await actions.removeNoteId(note._id)
  }),
  removeNoteId: thunk(async (actions, noteId) => {
    const note = await db.get(noteId)
    await db.put({ ...note, _deleted: true, modifiedAt: Date.now() })
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
    const { rows } = await db.allDocs({
      include_docs: true,
    })
    const docs = rows.map(R.prop('doc'))
    actions.replaceAll(docs)
    const changes = db
      .changes({
        include_docs: true,
        live: true,
        since: 'now',
      })
      .on('change', actions.handleChange)
      .on('error', console.error)
    return { changes }
  }),

  handleSyncUpdate: (state, info) => {
    //     console.log('handleSyncUpdate', info, sync)
    const syncState = sync
      ? {
          push: R.path(['push', 'state'])(sync),
          pull: R.path(['pull', 'state'])(sync),
        }
      : {}
    return R.assoc('syncLastUpdate')({ ...syncState, info })(state)
  },
  handleSyncError: (state, err) => {
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
          .on('change', actions.handleSyncUpdate)
          .on('paused', actions.handleSyncUpdate)
          .on('active', actions.handleSyncUpdate)
          .on('complete', actions.handleSyncUpdate)
          .on('denied', actions.handleSyncUpdate)
          .on('error', actions.handleSyncError)
      } catch (e) {
        debugger
        actions.syncError(e)
      }
    }
  }),
}

function pouchDocsToIdLookup(docs) {
  validate('A', arguments)
  return objFromList(R.prop('_id'))(docs)
}

const storeModel = {
  debug: {
    inspectorVisible: true,
    toggleInspector: state => overProp('inspectorVisible')(R.not)(state),
    hideInspector: state => R.assoc('inspectorVisible')(false)(state),
  },
  notes: notesModel,
}

export { storeModel }

export function useNotesActions() {
  return useActions(R.prop('notes'))
}
export function useNotes() {
  return useStore(R.prop('notes'))
}
