import { useActions, useStore } from 'easy-peasy'
import { Inspector } from 'react-inspector'
import React from 'react'
import Dialog from '@material-ui/core/Dialog'

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
