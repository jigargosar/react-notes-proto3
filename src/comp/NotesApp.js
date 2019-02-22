import React from 'react'
import { useNotesActions } from '../store-model'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
// import MenuIcon from '@material-ui/icons/Menu'
// import More from '@material-ui/icons/MoreVert'
import { SettingsDialog } from './SettingsDialog'
import { NoteList } from './NoteList'
import { TopAppBar } from './TopAppBar'

export function NotesApp() {
  return (
    <div className="pb5">
      <TopAppBar />
      <NoteList />
      <SettingsDialog />
      <AddNoteFab />
    </div>
  )
}

function AddNoteFab({ classes, ...otherProps }) {
  const { addNewNote } = useNotesActions()
  return (
    <Fab
      className={`fixed bottom-1 right-1`}
      size="small"
      color="secondary"
      onClick={() => addNewNote()}
      {...otherProps}
    >
      <AddIcon />
    </Fab>
  )
}
