import { getType as getNodeType } from 'mobx-state-tree'

export function getNodeName(s) {
  return getNodeType(s).name
}
