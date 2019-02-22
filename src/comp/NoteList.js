import { useNotes, useNotesActions } from '../store-model'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import React from 'react'
import List from '@material-ui/core/List'
import CheckIcon from '@material-ui/icons/Check'
import { EditNoteDialog } from './EditNoteDialog'
import { withStyles } from '@material-ui/core/styles'
import { Avatar, ListItemAvatar } from '@material-ui/core'
import toMaterialStyle from 'material-color-hash'
import * as R from 'ramda'
import { pipe } from '../ramda-helpers'

function NoteAvatar({ note, isSelected }) {
  const { isSingleSelectMode } = useNotes()
  const { setSelectionModeMultiple } = useNotesActions()
  const avatarContent = pipe([R.trim, R.take(2)])(note.content)

  const baseStyle = toMaterialStyle(note._id)

  const selectedInMultiSelectModeStyle = {
    backgroundColor: 'rgba(0,0,0,0.75)',
    color: 'white',
  }

  const isMultiSelectMode = !isSingleSelectMode
  const isSelectedInMultiSelectMode = isSelected && isMultiSelectMode
  return (
    <ListItemAvatar>
      <Avatar
        style={
          isSelectedInMultiSelectMode
            ? selectedInMultiSelectModeStyle
            : baseStyle
        }
        onClick={() => setSelectionModeMultiple()}
      >
        {isSelectedInMultiSelectMode ? <CheckIcon /> : avatarContent}
      </Avatar>
    </ListItemAvatar>
  )
}

const NoteItem = withStyles({
  root: {
    '&$selected, &$selected:hover, &$selected:focus': {
      backgroundColor: 'lightyellow',
    },
  },
  selected: {},
})(({ note, isSelected, classes }) => {
  const { isSingleSelectMode, isMultiSelectMode } = useNotes()
  const { openEditNoteDialog, setNoteSelected } = useNotesActions()

  return (
    <ListItem
      selected={isSelected}
      classes={{ root: classes.root, selected: classes.selected }}
      onClick={
        isMultiSelectMode
          ? () =>
              setNoteSelected({
                note,
                selected: isSingleSelectMode ? true : !isSelected,
              })
          : null
      }
      // dense={true}
    >
      <NoteAvatar note={note} isSelected={isSelected} />
      <ListItemText>{note.content}</ListItemText>
      <ListItemSecondaryAction>
        <IconButton onClick={() => openEditNoteDialog(note)}>
          <EditIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
})

export function NoteList() {
  const { visibleNotes, selectedIdDict } = useNotes()
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
      <EditNoteDialog />
    </>
  )
}
