import React from 'react'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
// import MenuIcon from '@material-ui/icons/Menu'
// import More from '@material-ui/icons/MoreVert'
import { SettingsDialog } from './SettingsDialog'
import { NoteList } from './NoteList'
import { TopAppBar } from './TopAppBar'
import { rs } from '../store-mst'
import { mc } from '../mob-act'

export const NotesApp = mc(function NotesApp() {
  return (
    <div className="pb5">
      <TopAppBar />
      <NoteList />
      <SettingsDialog />
      <AddNoteFab />
    </div>
  )
})
function AddNoteFab({ classes, ...otherProps }) {
  return (
    <Fab
      className={`fixed bottom-1 right-1`}
      size="small"
      color="secondary"
      onClick={rs.addNewNoteClicked}
      {...otherProps}
    >
      <AddIcon />
    </Fab>
  )
}
