import React, { useEffect } from 'react'
import { EditDialog } from './EditNoteDialog'
import { useNotes, useNotesActions } from '../store-model'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import { withStyles } from '@material-ui/core/styles'
// import MenuIcon from '@material-ui/icons/Menu'
// import More from '@material-ui/icons/MoreVert'
import { SettingsDialog } from './SettingsDialog'
import { NoteList } from './NoteList'
import { TopAppBar } from './TopAppBar'

export function NotesApp() {
  const { remoteUrl, editNote } = useNotes()

  const { startSync } = useNotesActions()

  useEffect(() => {
    startSync().catch(console.error)
  }, [remoteUrl])

  return (
    <div className="pb5">
      <TopAppBar />
      <NoteList />
      {editNote && <EditDialog note={editNote} />}
      <SettingsDialog />
      <AddNoteFab />
    </div>
  )
}

const AddNoteFab = withStyles({
  root: {
    position: 'fixed',
  },
})(function AddNoteFab({ classes, ...otherProps }) {
  const { addNew } = useNotesActions()
  return (
    <Fab
      className={`absolute bottom-1 right-1 ${classes.root}`}
      size="small"
      color="secondary"
      onClick={() => addNew()}
      {...otherProps}
    >
      <AddIcon />
    </Fab>
  )
})
