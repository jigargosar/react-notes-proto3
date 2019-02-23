import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { pipe } from '../ramda-helpers'
import { mc } from '../mob-act'
import { rs } from '../store-mst'

const enhance = pipe([mc, withMobileDialog({ breakpoint: 'xs' })])

export const SettingsDialog = enhance(function SettingsDialog({
  fullScreen,
}) {
  // const { setRemoteUrl, closeSettingsDialog: close } = useNotesActions()
  //
  // const { remoteUrl, isSettingsDialogOpen } = useNotes()

  // const initState = () => remoteUrl || ''
  // const [ipt, setIpt] = useState(initState)

  // const onSave = () => {
  //   setRemoteUrl(ipt)
  //   close()
  // }

  // const onDiscard = () => {
  //   setIpt(initState())
  //   close()
  // }

  return (
    <Dialog
      onClose={rs.settingsDialogOnClose}
      open={rs.isSettingsDialogOpen}
      fullScreen={fullScreen}
    >
      <DialogTitle>Sync with CouchDB</DialogTitle>
      <DialogContent style={{ minWidth: '400px' }}>
        <TextField
          label="CouchDB URL"
          value={rs.settingsDialogRemoteUrl}
          onChange={rs.onSettingsDialogRemoteUrlChange}
          name="remote-couch-url"
          margin="normal"
          fullWidth
          // variant="outlined"
        />
      </DialogContent>
      <DialogActions className="flex flex-row-reverse justify-start">
        <Button onClick={rs.onSettingsDialogSaveClicked} color="primary">
          Save
        </Button>
        <Button
          onClick={rs.onSettingsDialogDiscardClicked}
          color="primary"
        >
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  )
})
