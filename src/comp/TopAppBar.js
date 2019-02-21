import { withStyles } from '@material-ui/core'
import { useNotes, useNotesActions } from '../store-model'
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
import MoreVertIcon from '@material-ui/icons/MoreVert'

import React from 'react'
import clsx from 'clsx'

function SyncStatusIcon() {
  const { syncStatus } = useNotes()
  const iconMap = {
    synced: SyncIcon,
    disabled: SyncDisabledIcon,
    problem: SyncProblemIcon,
    syncing: SyncIcon,
  }

  //console.log(syncStatus)

  const SyncStatusIcon = iconMap[syncStatus] || SettingsIcon

  return (
    <SyncStatusIcon
      className={clsx('spin', { 'spin-paused': syncStatus !== 'syncing' })}
    />
  )
}

function SyncStatusIconButton() {
  const { openSettingsDialog } = useNotesActions()
  return (
    <IconButton color="inherit" onClick={() => openSettingsDialog()}>
      <SyncStatusIcon />
    </IconButton>
  )
}

function HeaderIconBtn(props) {
  return <IconButton color="inherit" {...props} />
}

export const TopAppBar = withStyles(theme => ({
  toolbar: theme.mixins.toolbar,
  menuIcon: { marginLeft: '-0.75rem' },
}))(function TopBar({ classes }) {
  const { syncStatus, selectedNotesCount } = useNotes()
  const isAnySelected = selectedNotesCount > 0
  const {
    selectAll,
    clearSelection,
    deleteAllSelected,
  } = useNotesActions()
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Notes
          </Typography>
          <SyncStatusIconButton />
          <div className="mh2 ttc">{syncStatus}</div>
          <div className="flex-grow-1" />
          {isAnySelected && (
            <>
              <div className="ta-c tc w2 ">{selectedNotesCount}</div>
              <HeaderIconBtn color="inherit" onClick={() => selectAll()}>
                <SelectAllIcon />
              </HeaderIconBtn>
              <HeaderIconBtn onClick={() => clearSelection()}>
                <ClearSelectionIcon />
              </HeaderIconBtn>
              <HeaderIconBtn onClick={() => deleteAllSelected()}>
                <DeleteAllIcon />
              </HeaderIconBtn>
            </>
          )}
          <HeaderIconBtn>
            <MoreVertIcon />
          </HeaderIconBtn>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
    </>
  )
})
