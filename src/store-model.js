import * as R from 'ramda'
import {
  _idProp,
  isNotNil,
  objFromList,
  overProp,
  pipe,
  toggleProp,
} from './ramda-helpers'
import validate from 'aproba'
import nanoid from 'nanoid'
import faker from 'faker'
import { listen, select, thunk, useActions, useStore } from 'easy-peasy'
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

function toggleNoteSelection(note) {
  return overProp('selectedIdDict')(toggleProp(note._id))
}

// const turnOffMultiSelectMode = R.assoc('isMultiSelectMode')(false)
// const turnOnMultiSelectMode = R.assoc('isMultiSelectMode')(true)
const clearSelectIdDict = R.assoc('selectedIdDict')({})

export const notesModel = {
  byId: {},
  visibleNotes: select(getVisibleNotes),
  visibleNotesCount: select(pipe([R.prop('visibleNotes'), R.length])),

  isMultiSelectMode: select(
    R.propSatisfies(R.gt(R.__, 0))('selectedNotesCount'),
  ),

  selectedIdDict: {},
  clearSelection: clearSelectIdDict,
  toggleNoteMultiSelection: (state, note) => {
    const isMultiSelectMode = state.isMultiSelectMode

    if (isMultiSelectMode) {
      return toggleNoteSelection(note)(state)
    } else {
      return pipe([clearSelectIdDict, toggleNoteSelection(note)])(state)
    }
  },
  listenOnToggleMultiSelection: listen(on => {
    on(
      notesModel.toggleNoteMultiSelection,
      (actions, payload, { getState }) => {
        if (getState().notes.selectedNotesCount === 0) {
          actions.clearSelection()
        }
      },
    )
  }),
  selectAll: state => {
    const visibleNoteIds = state.visibleNotes.map(_idProp)
    return R.assoc('selectedIdDict')(
      R.zipObj(visibleNoteIds, R.repeat(true)(visibleNoteIds.length)),
    )(state)
  },
  selectedNotes: select(state => {
    if (R.is(Function)(state)) {
      debugger
    }
    return pipe([
      R.prop('selectedIdDict'),
      R.filter(R.identity),
      R.keys,
      R.map(R.prop(R.__, state.byId)),
      R.filter(isNotNil),
    ])(state)
  }),
  selectedNotesCount: select(pipe([R.prop('selectedNotes'), R.length])),
  deleteSelectedNotes: thunk(async (actions, payload, { getState }) => {
    await actions.deleteNotes(getState().notes.selectedNotes)
    actions.clearSelection()
  }),

  editingNote: null,
  editingNoteContent: '',
  isEditNoteDialogOpen: false,
  closeEditNoteDialog: pipe([R.assoc('isEditNoteDialogOpen')(false)]),
  openEditNoteDialog: (state, note) =>
    pipe([
      R.assoc('editingNote')(note),
      R.assoc('editingNoteContent')(note.content),
      R.assoc('isEditNoteDialogOpen')(true),
    ])(state),
  updateEditingNoteContent: (state, content) =>
    pipe([R.assoc('editingNoteContent', content)])(state),
  saveEditingNoteDialog: thunk(async (actions, payload, { getState }) => {
    const notes = getState().notes
    const note = notes.editingNote
    const content = notes.editingNoteContent
    await db.put({
      ...note,
      content,
      modifiedAt: Date.now(),
    })
    actions.closeEditNoteDialog()
  }),
  deleteEditingNote: thunk(async (actions, content, { getState }) => {
    actions.deleteNotes([getState().notes.editingNote])
    actions.closeEditNoteDialog()
  }),

  addNewNote: thunk(async () => {
    const note = createNewNote()
    await db.put(note)
  }),
  deleteNotes: thunk(async (actions, notes) => {
    const bulkNotes = notes.map(
      R.mergeLeft({
        _deleted: true,
        modifiedAt: Date.now(),
      }),
    )
    const bulkRes = await db.bulkDocs(bulkNotes)
    console.log(bulkRes)
  }),

  replaceAll: (state, docs) => setLookupFromDocs(docs)(state),
  handleChange: (state, change) => {
    console.debug(`change`, change)
    const note = change.doc
    const mergeNote = R.assocPath(['byId', note._id])(note)
    const omitNote = R.dissocPath(['byId', note._id])

    const update = change.deleted ? omitNote : mergeNote
    return update(state)
  },
  initPouch: thunk(async actions => {
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
    actions.startSync()
    return { changes }
  }),

  isSettingsDialogOpen: false,
  openSettingsDialog: R.assoc('isSettingsDialogOpen', true),
  closeSettingsDialog: R.assoc('isSettingsDialogOpen', false),
  setRemoteUrl: (state, remoteUrl) => {
    return R.assoc('remoteUrl')(remoteUrl)(state)
  },
  discardSettingsDialog: thunk(actions => {
    actions.closeSettingsDialog()
  }),
  saveSettingsDialog: thunk(async (actions, newRemoteUrl) => {
    actions.closeSettingsDialog()
    actions.setRemoteUrl(newRemoteUrl)
    await actions.startSync()
  }),

  remoteUrl: null,
  syncErr: null,
  syncLastUpdate: null,
  syncStatus: select(state => {
    const mapping = {
      pending: 'synced',
      stopped: 'problem',
      active: 'syncing',
    }
    return R.propOr('disabled', (state.syncLastUpdate || {}).push)(mapping)
  }),
  handleSyncUpdate: (state, info) => {
    console.debug('handleSyncUpdate', info, sync)
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
