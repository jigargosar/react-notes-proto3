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
import CheckIcon from '@material-ui/icons/Check'

import React, { useRef, useState } from 'react'
import clsx from 'clsx'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

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

function MoreMenu({ classes }) {
  const { openSettingsDialog, toggleSelectionMode } = useNotesActions()
  const { isMultiSelectMode } = useNotes()

  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const handleClose = () => closeMenu()
  const handleOpen = () => setMenuOpen(true)
  const handleSyncSettings = () => {
    openSettingsDialog()
    closeMenu()
  }
  const handleBatchMode = () => {
    toggleSelectionMode()
    closeMenu()
  }
  const anchorRef = useRef(null)
  return (
    <>
      <HeaderIconBtn
        buttonRef={anchorRef}
        className={classes.moreButton}
        onClick={handleOpen}
      >
        <MoreVertIcon />
      </HeaderIconBtn>
      <Menu
        anchorEl={anchorRef.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={menuOpen}
        onClose={handleClose}
      >
        <MenuItem onClick={handleBatchMode}>
          <div className={clsx({ 'o-0': !isMultiSelectMode })}>
            <CheckIcon />
          </div>
          Bulk Mode
        </MenuItem>
        <MenuItem onClick={handleSyncSettings}>Sync Settings</MenuItem>
      </Menu>
    </>
  )
}

export const TopAppBar = withStyles(theme => ({
  toolbar: theme.mixins.toolbar,
  menuIcon: { marginLeft: '-0.75rem' },
  moreButton: { marginRight: '-0.75rem' },
  logo: { marginRight: '0rem' },
}))(function TopBar({ classes }) {
  const { syncStatus, selectedNotesCount, isMultiSelectMode } = useNotes()
  const {
    selectAll,
    clearSelection,
    deleteSelectedNotes,
  } = useNotesActions()

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            color="inherit"
            className={classes.logo}
          >
            Notes
          </Typography>
          <SyncStatusIconButton />
          <Typography
            variant="body2"
            color="inherit"
            className={classes.logo}
          >
            {syncStatus}
          </Typography>
          <div className="flex-grow-1" />
          {isMultiSelectMode && (
            <>
              <div className="ta-c tc w2 ">{selectedNotesCount}</div>
              <HeaderIconBtn color="inherit" onClick={() => selectAll()}>
                <SelectAllIcon />
              </HeaderIconBtn>
              <HeaderIconBtn onClick={() => clearSelection()}>
                <ClearSelectionIcon />
              </HeaderIconBtn>
              <HeaderIconBtn onClick={() => deleteSelectedNotes()}>
                <DeleteAllIcon />
              </HeaderIconBtn>
            </>
          )}
          <MoreMenu classes={classes} />
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
    </>
  )
})
