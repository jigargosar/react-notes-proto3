import { withStyles } from '@material-ui/core'
import { useNotes, useNotesActions } from './store-hooks'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import SettingsIcon from '@material-ui/icons/Settings'
import SyncIcon from '@material-ui/icons/Sync'
import SyncDisabledIcon from '@material-ui/icons/SyncDisabled'
import SyncProblemIcon from '@material-ui/icons/SyncProblem'
import SelectAllIcon from '@material-ui/icons/SelectAll'
import SelectOffIcon from 'mdi-material-ui/SelectOff'
import DeleteAllIcon from '@material-ui/icons/DeleteSweep'
import MoreVertIcon from '@material-ui/icons/MoreVert'

import React, { useRef, useState } from 'react'
import clsx from 'clsx'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { rs } from '../store-mst'

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

function SyncStatusIconButton(props) {
  return (
    <IconButton color="inherit" {...props}>
      <SyncStatusIcon />
    </IconButton>
  )
}

function HeaderIconBtn(props) {
  return <IconButton color="inherit" {...props} />
}

function MoreMenu({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const handleClose = () => closeMenu()
  const handleOpen = () => setMenuOpen(true)
  const anchorRef = useRef(null)
  return (
    <>
      <HeaderIconBtn
        buttonRef={anchorRef}
        className="nr2"
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
        onClick={handleClose}
      >
        {children}
      </Menu>
    </>
  )
}

export const TopAppBar = withStyles(theme => ({
  toolbar: theme.mixins.toolbar,
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
          <Typography variant="h6" color="inherit">
            Notes
          </Typography>
          <SyncStatusIconButton onClick={rs.openSettingsDialogClicked} />
          <Typography variant="body2" color="inherit">
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
                <SelectOffIcon />
              </HeaderIconBtn>
              <HeaderIconBtn onClick={() => deleteSelectedNotes()}>
                <DeleteAllIcon />
              </HeaderIconBtn>
            </>
          )}
          <MoreMenu>
            <MenuItem onClick={rs.openSettingsDialogClicked}>
              <ListItemIcon>
                <SyncIcon />
              </ListItemIcon>
              <ListItemText>Sync Settings</ListItemText>
            </MenuItem>
          </MoreMenu>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
    </>
  )
})
