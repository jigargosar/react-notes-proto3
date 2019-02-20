import { withStyles } from '@material-ui/core'
import { useNoteActions, useNotes } from './store-model'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import SettingsIcon from '@material-ui/icons/Settings'
import SyncIcon from '@material-ui/icons/Sync'
import SyncDisabled from '@material-ui/icons/SyncDisabled'
import SyncProblem from '@material-ui/icons/SyncProblem'

import React from 'react'

function SyncStatusIconButton() {
  const { syncStatus } = useNotes()
  const iconMap = {
    synced: SyncIcon,
    disabled: SyncDisabled,
    problem: SyncProblem,
    syncing: SyncIcon,
  }

  console.log(syncStatus)

  const SyncStatusIcon = iconMap[syncStatus] || SettingsIcon

  const { openSettingsDialog } = useNoteActions()
  return (
    <IconButton color="inherit" onClick={() => openSettingsDialog()}>
      <SyncStatusIcon
        className={syncStatus === 'syncing' ? 'spin' : 'restore-spin'}
      />
    </IconButton>
  )
}

export const TopAppBar = withStyles(theme => ({
  toolbar: theme.mixins.toolbar,
  menuIcon: { marginLeft: '-0.75rem' },
}))(function TopBar({ classes }) {
  const { syncStatus } = useNotes()
  const { openSettingsDialog } = useNoteActions()
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" color="inherit" className="flex-grow-1">
            Notes
          </Typography>
          <div className="mh2 ttc">{syncStatus}</div>
          <SyncStatusIconButton />
          <IconButton color="inherit" onClick={() => openSettingsDialog()}>
            <SettingsIcon className="animate-rotate" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
    </>
  )
})
