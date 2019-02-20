import React, { useState } from 'react'
import Dialog from '@material-ui/core/Dialog'
import { withStyles } from '@material-ui/core/styles'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { useNoteActions } from './store-model'
import { pipe } from './ramda-helpers'

export const EditDialog = pipe([
  withMobileDialog({ breakpoint: 'xs' }),
  withStyles({ dialogActions: { justifyContent: 'flex-start' } }),
])(function EditDialog({ note, fullScreen, classes }) {
  const { closeEditDialog, saveNoteContent } = useNoteActions()

  const [content, setContent] = useState(() => note.content)
  const [origNote] = useState(() => note)
  const onClose = () => closeEditDialog()
  const onSave = () => {
    saveNoteContent({ content, note: origNote })
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
        <Button onClick={onClose} color="primary">
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  )
})
