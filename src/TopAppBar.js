import { withStyles } from '@material-ui/core'
import { useNotes, useNotesActions } from './store-model'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import SettingsIcon from '@material-ui/icons/Settings'
import SyncIcon from '@material-ui/icons/Sync'
import SyncDisabledIcon from '@material-ui/icons/SyncDisabled'
import SyncProblemIcon from '@material-ui/icons/SyncProblem'
import SelectAllIcon from '@material-ui/icons/SelectAll'
import ClearSelectionIcon from '@material-ui/icons/Clear'
import DeleteAllIcon from '@material-ui/icons/DeleteSweep'

import React from 'react'

function SyncStatusIconButton() {
  const { syncStatus } = useNotes()
  const iconMap = {
    synced: SyncIcon,
    disabled: SyncDisabledIcon,
    problem: SyncProblemIcon,
    syncing: SyncIcon,
  }

  //console.log(syncStatus)

  const SyncStatusIcon = iconMap[syncStatus] || SettingsIcon

  const { openSettingsDialog } = useNotesActions()
  return (
    <IconButton color="inherit" onClick={() => openSettingsDialog()}>
      <SyncStatusIcon
        className={`spin ${
          syncStatus === 'syncing' ? '' : 'spin-paused'
        }  `}
      />
    </IconButton>
  )
}

export const TopAppBar = withStyles(theme => ({
  toolbar: theme.mixins.toolbar,
  menuIcon: { marginLeft: '-0.75rem' },
}))(function TopBar({ classes }) {
  const { syncStatus } = useNotes()
  const {
    selectAll,
    clearSelection,
    deleteAllSelected,
  } = useNotesActions()
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" color="inherit" className="flex-grow-1">
            Notes
          </Typography>
          <div className="mh2 ttc">{syncStatus}</div>
          <SyncStatusIconButton />
          <IconButton color="inherit" onClick={() => selectAll()}>
            <SelectAllIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => clearSelection()}>
            <ClearSelectionIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => deleteAllSelected()}>
            <DeleteAllIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
    </>
  )
})
