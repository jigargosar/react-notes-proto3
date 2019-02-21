import React, { useState } from 'react'
import Dialog from '@material-ui/core/Dialog'
import { withStyles } from '@material-ui/core/styles'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { useNotesActions } from '../store-model'
import { pipe } from '../ramda-helpers'

const enhance = pipe([
  withMobileDialog({ breakpoint: 'xs' }),
  withStyles({ dialogActions: { justifyContent: 'flex-start' } }),
])

export const EditDialog = enhance(function EditDialog({
  note,
  fullScreen,
  classes,
}) {
  const {
    remove,
    closeEditDialog,
    saveEditingNoteContent,
  } = useNotesActions()

  const [content, setContent] = useState(() => note.content)
  const onClose = () => closeEditDialog()
  const onSave = () => {
    saveEditingNoteContent(content)
  }

  const onDelete = () => {
    remove(note)
    onClose()
  }
  return (
    <Dialog onClose={onClose} open={true} fullScreen={fullScreen}>
      <DialogTitle>Edit Note</DialogTitle>
      <DialogContent style={{ minWidth: '400px' }}>
        <TextField
          autoFocus
          multiline
          value={content}
          onChange={e => setContent(e.target.value)}
          // className={classes.textField}
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