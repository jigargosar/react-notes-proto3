import { useStore } from 'easy-peasy'
import { Portal } from 'react-portal'
import { Inspector } from 'react-inspector'
import React from 'react'

export function InspectState() {
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
