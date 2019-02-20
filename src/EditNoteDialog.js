import React, { useState } from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { useNoteActions } from './store-model'

export const EditDialog = withMobileDialog({ breakpoint: 'xs' })(
  function EditDialog({ note, fullScreen }) {
    const { closeEditDialog, saveNoteContent } = useNoteActions()

    const [content, setContent] = useState(() => note.content)
    const onClose = () => closeEditDialog()
    const onSave = () => {
      saveNoteContent({ content, note })
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
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Discard
          </Button>
          <Button onClick={onSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    )
  },
)
