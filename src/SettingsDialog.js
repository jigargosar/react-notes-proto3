import React, { useState } from 'react'
import Dialog from '@material-ui/core/Dialog'
import { withStyles } from '@material-ui/core/styles'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { useNoteActions, useNotes } from './store-model'
import { pipe } from './ramda-helpers'

const enhance = pipe([
  withMobileDialog({ breakpoint: 'xs' }),
  withStyles({ dialogActions: { justifyContent: 'flex-start' } }),
])

export const SettingsDialog = enhance(function SettingsDialog({
  fullScreen,
  classes,
}) {
  const { setRemoteUrl, closeSettingsDialog: close } = useNoteActions()

  const { remoteUrl, isSettingsDialogOpen } = useNotes()

  const initState = () => remoteUrl || ''
  const [ipt, setIpt] = useState(initState)

  const onSave = () => {
    setRemoteUrl(ipt)
    close()
  }

  const onDiscard = () => {
    setIpt(initState())
    close()
  }

  return (
    <Dialog
      onClose={onDiscard}
      open={isSettingsDialogOpen}
      fullScreen={fullScreen}
    >
      <DialogTitle>Sync with CouchDB</DialogTitle>
      <DialogContent style={{ minWidth: '400px' }}>
        <TextField
          label="CouchDB URL"
          value={ipt}
          onChange={e => setIpt(e.target.value)}
          name="remote-couch-url"
          margin="normal"
          fullWidth
          // variant="outlined"
        />
      </DialogContent>
      <DialogActions
        className="flex flex-row-reverse justify-start"
        classes={{ root: classes.dialogActions }}
      >
        <Button onClick={onSave} color="primary">
          Save
        </Button>
        <Button onClick={onDiscard} color="primary">
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  )
})
