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
import validate from 'aproba'

function noteAvatarText(note) {
  validate('O', arguments)

  return pipe([R.trim, R.take(2)])(note.content)
}

function NoteAvatar({ note, isSelected, ...otherProps }) {
  const { isMultiSelectMode } = useNotes()
  const isSelectedInMultiSelectMode = isSelected && isMultiSelectMode

  const avatarContent = isSelectedInMultiSelectMode ? (
    <CheckIcon />
  ) : (
    noteAvatarText(note)
  )

  const style = isSelectedInMultiSelectMode
    ? {
        backgroundColor: 'rgba(0,0,0,0.75)',
        color: 'white',
      }
    : toMaterialStyle(note._id)

  return (
    <ListItemAvatar style={style} {...otherProps}>
      <Avatar>{avatarContent}</Avatar>
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
  const {
    openEditNoteDialog,
    toggleNoteSelection,
    setSelectionModeMultiple,
  } = useNotesActions()

  function handleClick(e) {
    validate('O', arguments)
    if (e.defaultPrevented) return
    toggleNoteSelection(note)
  }

  async function handleAvatarClick(e) {
    validate('O', arguments)
    e.preventDefault()
    await toggleNoteSelection(note)
    setSelectionModeMultiple()
  }
  return (
    <ListItem
      selected={isSelected}
      classes={{ root: classes.root, selected: classes.selected }}
      onClick={handleClick}
      // dense={true}
    >
      <NoteAvatar
        note={note}
        isSelected={isSelected}
        onClick={handleAvatarClick}
      />
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
