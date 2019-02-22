import { useNotes, useNotesActions } from './store-hooks'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import React from 'react'
import List from '@material-ui/core/List'
import CheckIcon from '@material-ui/icons/Check'
import { EditNoteDialog } from './EditNoteDialog'
import Avatar from '@material-ui/core/Avatar'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import toMaterialStyle from 'material-color-hash'
import * as R from 'ramda'
import { pipe } from '../ramda-helpers'
import validate from 'aproba'
import { rs } from '../store-mst'
import { mc } from '../mob-act'
import { Fab } from '@material-ui/core'

function noteAvatarText(note) {
  validate('O', arguments)
  return pipe([R.trim, R.take(2)])(note.content)
}

const NoteAvatar = mc(function NoteAvatar({
  note,
  isSelected,
  ...otherProps
}) {
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
    <Avatar style={style} {...otherProps}>
      {avatarContent}
    </Avatar>
  )
})

const NoteItem = mc(function NoteItem({ note, isSelected }) {
  const { isMultiSelectMode } = useNotes()

  const {
    openEditNoteDialog,
    toggleNoteMultiSelection,
  } = useNotesActions()

  function handleClick(e) {
    validate('O', arguments)
    if (e.defaultPrevented) return
    if (isMultiSelectMode) {
      toggleNoteMultiSelection(note)
    }
  }

  async function handleAvatarClick(e) {
    validate('O', arguments)
    e.preventDefault()
    toggleNoteMultiSelection(note)
  }

  return (
    <ListItem selected={isSelected} onClick={handleClick}>
      <ListItemAvatar>
        <NoteAvatar
          note={note}
          isSelected={isSelected}
          onClick={handleAvatarClick}
        />
      </ListItemAvatar>
      <ListItemText>{note.content}</ListItemText>
      <ListItemSecondaryAction>
        <IconButton
          disabled={isMultiSelectMode}
          onClick={() => openEditNoteDialog(note)}
        >
          <EditIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
})
export const NoteList = mc(function NoteList() {
  const { visibleNotes, selectedIdDict } = useNotes()
  return (
    <>
      <div className="pa3 flex">
        <div className="flex-grow-1">{rs.msg}</div>
        <Fab onClick={rs.onAddNewNoteClicked}>AN</Fab>
      </div>
      {rs.visNotes.map(n => (
        <div key={n.id} className="" />
      ))}
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
})
