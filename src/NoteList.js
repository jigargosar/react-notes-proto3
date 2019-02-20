import { useNoteActions, useNotes } from './store-model'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import React from 'react'
import List from '@material-ui/core/List'
import Checkbox from '@material-ui/core/Checkbox'

function NoteItem({ note }) {
  const { startEditing } = useNoteActions()

  return (
    <ListItem button disableGutters={true}>
      <Checkbox
        // checked={}
        tabIndex={-1}
        disableRipple
      />
      <ListItemText style={{ padding: 0 }}>{note.content}</ListItemText>
      <ListItemSecondaryAction>
        <IconButton onClick={() => startEditing(note)}>
          <EditIcon />
        </IconButton>
      </ListItemSecondaryAction>
      {/*<div className="pl3 pv3 flex flex-column">*/}
      {/*  /!*<button onClick={() => remove(note)}>X</button>*!/*/}
      {/*</div>*/}
    </ListItem>
  )
}

export function NoteList() {
  const { visibleNotes } = useNotes()
  return (
    <List>
      {visibleNotes.map(note => (
        <NoteItem key={note._id} note={note} />
      ))}
    </List>
  )
}
