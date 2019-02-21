import { useActions, useStore } from 'easy-peasy'
import { Portal } from 'react-portal'
import { Inspector } from 'react-inspector'
import React from 'react'
import Dialog from '@material-ui/core/Dialog'

export function PortalInspectState() {
  const { state } = useStore(state => ({
    state,
  }))
  return (
    <PortalInspector
      data={state}
      name={'state'}
      expandPaths={[
        '$',
        '$.todos',
        '$.todos.items',
        '$.notes',
        '$.notes.visibleNotes',
      ]}
    />
  )
}

export function PortalInspector(props) {
  const { visible } = useStore(state => ({
    visible: state.debug.inspectorVisible,
  }))

  return (
    visible && (
      <Portal node={document.getElementById('portal-inspector')}>
        <div className="ma2">
          <Inspector {...props} />
        </div>
      </Portal>
    )
  )
}

export function PortalInspectorToolbar() {
  const { visible } = useStore(state => ({
    visible: state.debug.inspectorVisible,
  }))

  const hideInspector = useActions(actions => actions.debug.hideInspector)

  return (
    visible && (
      <Portal node={document.getElementById('portal-inspector')}>
        <div className="ma2">
          <button onClick={() => hideInspector()}>Close</button>
        </div>
      </Portal>
    )
  )
}

export function InspectorDialog({ store }) {
  const { state } = useStore(state => ({
    state,
  }))

  const { visible } = useStore(state => ({
    visible: state.debug.inspectorVisible,
  }))

  const hideInspector = useActions(actions => actions.debug.hideInspector)

  return (
    <Dialog open={visible} onClose={() => hideInspector()}>
      <Inspector
        data={state}
        name={'state'}
        expandPaths={[
          '$',
          '$.todos',
          '$.todos.items',
          '$.notes',
          '$.notes.visibleNotes',
        ]}
      />
      <Inspector data={store} />
    </Dialog>
  )
}
