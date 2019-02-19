import React, { useState } from 'react'
import SortableTree from 'react-sortable-tree'
import 'react-sortable-tree/style.css' // This only needs to be imported once in your app
import * as R from 'ramda'

function getTreeDataFromObj(data, depth) {
  if (depth > 2) {
    return []
  }
  return R.toPairs(data).map(([title, value]) => {
    const isObj = R.is(Object)(value)
    return {
      title,
      subtitle: `isObj:${isObj}`,
      children: isObj ? getTreeDataFromObj(value, depth + 1) : [],
    }
  })
}

export default function Tree({ data }) {
  const [treeData, set] = useState(() => getTreeDataFromObj(data, 0))

  return (
    <div style={{ height: 200, width: '100vw', zIndex: -1 }}>
      <SortableTree treeData={treeData} onChange={set} canDrag={false} />
    </div>
  )
}
