import { useActions, useStore } from 'easy-peasy'
import * as R from 'ramda'

export function useNotesActions() {
  return useActions(R.prop('notes'))
}

export function useNotes() {
  return useStore(R.prop('notes'))
}
