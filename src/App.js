import React, { useEffect } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import useHotKeys from 'react-hotkeys-hook'
import {
  PortalInspector,
  PortalInspectorToolbar,
  PortalInspectState,
} from './Inspect'
import { EditDialog } from './EditNoteDialog'
import { useNoteActions, useNotes } from './store-model'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import { withStyles } from '@material-ui/core/styles'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import MenuIcon from '@material-ui/icons/Menu'
// import More from '@material-ui/icons/MoreVert'
import Settings from '@material-ui/icons/Settings'
import AppBar from '@material-ui/core/AppBar'
import { SettingsDialog } from './SettingsDialog'
import { NoteList } from './NoteList'

const TopBar = withStyles(theme => ({
  toolbar: theme.mixins.toolbar,
  menuIcon: { marginLeft: '-0.75rem' },
}))(function TopBar({ classes }) {
  const { syncStatus } = useNotes()
  const { openSettingsDialog } = useNoteActions()
  return (
    <>
      <AppBar posit2ion="static">
        <Toolbar>
          {false && (
            <IconButton
              className={classes.menuIcon}
              color="inherit"
              aria-label="Menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" color="inherit" className="flex-grow-1">
            Notes
          </Typography>
          <div className="mh2 ttc">{syncStatus}</div>
          <IconButton color="inherit" onClick={() => openSettingsDialog()}>
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
    </>
  )
})

function NotesApp() {
  const { remoteUrl, editNote } = useNotes()

  const { startSync } = useNoteActions()

  useEffect(() => {
    startSync().catch(console.error)
  }, [remoteUrl])

  return (
    <div className="pb5">
      <TopBar />
      <NoteList />
      {editNote && <EditDialog note={editNote} />}
      <SettingsDialog />
      <AddNoteFab />
    </div>
  )
}

const AddNoteFab = withStyles({
  root: {
    position: 'fixed',
  },
})(function AddNoteFab({ classes, ...otherProps }) {
  const { addNew } = useNoteActions()
  return (
    <Fab
      className={`absolute bottom-1 right-1 ${classes.root}`}
      size="small"
      color="secondary"
      onClick={() => addNew()}
      {...otherProps}
    >
      <AddIcon />
    </Fab>
  )
})

function App({ store }) {
  useHotKeys('`', () => store.dispatch.debug.toggleInspector())

  return (
    <ErrorBoundary>
      <PortalInspectorToolbar />
      <PortalInspectState />
      <PortalInspector data={store} name={'store'} />
      <NotesApp />
    </ErrorBoundary>
  )
}

export { App }

if (module.hot) {
  module.hot.dispose(() => {
    console.clear()
  })
}
