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
import * as R from 'ramda'

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
    <Dialog onClose={R.identity} open={false} fullScreen={fullScreen}>
      <DialogTitle>Sync with CouchDB</DialogTitle>
      <DialogContent style={{ minWidth: '400px' }}>
        <TextField
          label="CouchDB URL"
          value={'ipt'}
          onChange={R.identity}
          name="remote-couch-url"
          margin="normal"
          fullWidth
          // variant="outlined"
        />
      </DialogContent>
      <DialogActions className="flex flex-row-reverse justify-start">
        <Button onClick={R.identity} color="primary">
          Save
        </Button>
        <Button onClick={R.identity} color="primary">
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  )
})
