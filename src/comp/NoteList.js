import { useNotes, useNotesActions } from '../store-model'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import React from 'react'
import List from '@material-ui/core/List'
import Checkbox from '@material-ui/core/Checkbox'
import { EditNoteDialog } from './EditNoteDialog'
import { withStyles } from '@material-ui/core/styles'

const NoteItem = withStyles({
  root: {
    '&$selected, &$selected:hover, &$selected:focus': {
      backgroundColor: 'lightyellow',
    },
  },
  selected: {},
})(({ note, isSelected, classes }) => {
  const { openEditNoteDialog, setNoteSelected } = useNotesActions()

  return (
    <ListItem
      button
      disableGutters={true}
      onClick={() => setNoteSelected({ note, selected: !isSelected })}
      selected={isSelected}
      classes={{ root: classes.root, selected: classes.selected }}
    >
      <Checkbox checked={isSelected} tabIndex={-1} disableRipple />
      <ListItemText style={{ padding: 0 }}>{note.content}</ListItemText>
      <ListItemSecondaryAction>
        <IconButton onClick={() => openEditNoteDialog(note)}>
          <EditIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
})
export function NoteList() {
  const { visibleNotes, selectedIdDict, editingNote } = useNotes()
  return (
    <>
      <List>
        {visibleNotes.map(note => {
          const id = note._id
          return (
            <NoteItem
              key={id}
              note={note}
              isSelected={!!selectedIdDict[id]}
            />
          )
        })}
      </List>
      {editingNote && <EditNoteDialog note={editingNote} />}
    </>
  )
}
