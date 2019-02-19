import * as R from 'ramda'
import nanoid from 'nanoid'
import faker from 'faker'
import { objFromList, overProp, pipe } from './ramda-helpers'
import { select, thunk } from 'easy-peasy'
import validate from 'aproba'
import PouchDB from 'pouchdb-browser'

const db = new PouchDB('notes-pdb')

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

const notesModel = {
  byId: {},
  selectedId: null,
  visibleNotes: select(getVisibleNotes),
  add: (state, note) =>
    pipe([R.assocPath(['byId', note._id])(note)])(state),
  addNew: thunk(async (actions, payload) => {
    const note = createNewNote()
    await db.put(note)
  }),
  remove: thunk(async (actions, note) => {
    await db.put({ ...note, _deleted: true })
  }),
  replaceAll: (state, docs) =>
    R.assoc('byId')(pouchDocsToIdLookup(docs))(state),
  handleChange: (state, change) => {
    console.log(`change`, change)
    const note = change.doc
    const mergeNote = R.assocPath(['byId', note._id])(note)
    const omitNote = R.dissocPath(['byId', note._id])

    const update = change.deleted ? omitNote : mergeNote
    return update(state)
  },
  initFromPouch: thunk(async (actions, payload) => {
    const { rows } = await db.allDocs({ include_docs: true })
    const docs = rows.map(R.prop('doc'))
    actions.replaceAll(docs)
    return db
      .changes({ include_docs: true, live: true, since: 'now' })
      .on('change', actions.handleChange)
      .on('error', console.error)
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
