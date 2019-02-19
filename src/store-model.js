import * as R from 'ramda'
import nanoid from 'nanoid'
import faker from 'faker'
import { objFromList, overProp, pipe } from './ramda-helpers'
import { select, thunk } from 'easy-peasy'
import PouchDB from 'pouchdb-browser'
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

function removeNote(state, note) {
  return R.dissocPath(['byId', note._id])(state)
}

const getVisibleNotes = pipe([
  R.prop('byId'),
  R.values,
  R.sortWith([R.descend(R.propOr(0, 'modifiedAt'))]),
])

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
  notes: {
    byId: {},
    selectedId: null,
    visibleNotes: select(getVisibleNotes),
    add: (state, note) =>
      pipe([R.assocPath(['byId', note._id])(note)])(state),
    addNew: thunk(async actions => {
      const note = createNewNote()
      await db.put(note)
    }),
    remove: removeNote,
    replaceAll(state, docs) {
      state.byId = pouchDocsToIdLookup(docs)
    },
    handleChange: (state, change) => {
      const note = change.doc
      return pipe([R.assocPath(['byId', note._id])(note)])(state)
    },
    loadAllFromPouch: thunk(async (actions, payload) => {
      const { rows } = await db.allDocs({ include_docs: true })
      const docs = rows.map(R.prop('doc'))
      actions.replaceAll(docs)
      const changes = db
        .changes({ include_docs: true, live: true, from: 'now' })
        .on('change', actions.handleChange)
        .on('error', console.error)
      return changes
    }),
  },
}

function pouchDocsToIdLookup(docs) {
  validate('A', arguments)
  return objFromList(R.prop('_id'))(docs)
}
