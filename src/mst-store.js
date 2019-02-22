import { getSnapshot as snap, types as t } from 'mobx-state-tree'

const Note = t.model('Note', {
  _id: t.identifier,
})

const NotesStore = t.model('NotesStore', {
  byId: t.map(Note),
})

const RootStore = t.model('RootStore', {
  notes: NotesStore,
})

const store = RootStore.create({ notes: {} })

snap(store) //?
