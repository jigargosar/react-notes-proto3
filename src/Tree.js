import React, { useState } from 'react'
import SortableTree from 'react-sortable-tree'
import 'react-sortable-tree/style.css' // This only needs to be imported once in your app

export default function Tree() {
  const [state, setState] = useState(() => ({
    treeData: [
      { title: 'Chicken', expanded: true, children: [{ title: 'Egg' }] },
    ],
  }))
  return (
    <div style={{ height: 200, width: '100vw', zIndex: -1 }}>
      <SortableTree
        treeData={state.treeData}
        onChange={treeData => setState({ treeData })}
        canDrag={false}
        generateNodeProps={nodeProps => {
          return { ...nodeProps, className: 'pa0' }
        }}
      />
    </div>
  )
}
