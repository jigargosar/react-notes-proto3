import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { pipe } from '../ramda-helpers'
import { rs } from '../store-mst'
import { mc } from '../mob-act'

const enhance = pipe([mc, withMobileDialog({ breakpoint: 'xs' })])

export const EditNoteDialog = enhance(function EditNoteDialog({
  fullScreen,
}) {
  return (
    <Dialog
      onClose={rs.editNoteDialogOnClose}
      open={rs.isEditNoteDialogOpen}
      fullScreen={fullScreen}
    >
      <DialogTitle>Edit Note</DialogTitle>
      <DialogContent style={{ minWidth: '400px' }}>
        <TextField
          autoFocus
          multiline
          value={rs.editingNoteContent}
          onChange={rs.onEditingNoteContentChanged}
          margin="normal"
          fullWidth
          variant="outlined"
        />
      </DialogContent>
      <DialogActions className="flex flex-row-reverse justify-start">
        <Button onClick={rs.onEditNoteDialogSaveClicked} color="primary">
          Save
        </Button>
        <Button
          onClick={rs.onEditNoteDialogDiscardClicked}
          color="default"
        >
          Discard
        </Button>
        <div className="flex-grow-1" />
        <Button
          onClick={rs.onEditNoteDialogDeleteClicked}
          color="secondary"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
})
