import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import { withStyles } from '@material-ui/core/styles'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { useNotes, useNotesActions } from '../store-model'
import { pipe } from '../ramda-helpers'

const enhance = pipe([
  withMobileDialog({ breakpoint: 'xs' }),
  withStyles({ dialogActions: { justifyContent: 'flex-start' } }),
])

export const EditNoteDialog = enhance(function EditNoteDialog({
  fullScreen,
  classes,
}) {
  const { editingNoteContent, isEditingNote } = useNotes()

  const {
    deleteEditingNote,
    discardEditNoteDialog,
    saveEditingNoteDialog,
    updateEditingNoteContent,
  } = useNotesActions()

  const onClose = () => discardEditNoteDialog()
  const onSave = () => saveEditingNoteDialog()

  const onDelete = () => deleteEditingNote()

  return (
    <Dialog onClose={onClose} open={isEditingNote} fullScreen={fullScreen}>
      <DialogTitle>Edit Note</DialogTitle>
      <DialogContent style={{ minWidth: '400px' }}>
        <TextField
          autoFocus
          multiline
          value={editingNoteContent || ''}
          onChange={e => updateEditingNoteContent(e.target.value)}
          margin="normal"
          fullWidth
          variant="outlined"
        />
      </DialogContent>
      <DialogActions
        className="flex flex-row-reverse justify-start"
        classes={{ root: classes.dialogActions }}
      >
        <Button onClick={onSave} color="primary">
          Save
        </Button>
        <Button onClick={onClose} color="default">
          Discard
        </Button>
        <div className="flex-grow-1" />
        <Button onClick={onDelete} color="secondary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
})
