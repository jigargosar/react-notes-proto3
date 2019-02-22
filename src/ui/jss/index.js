import { create } from 'jss'
import {
  createGenerateClassName,
  jssPreset,
} from '@material-ui/core/styles'
import React from 'react'

export const generateClassName = createGenerateClassName()
export const jss = create({
  ...jssPreset(),
  // We define a custom insertion point that JSS will look for injecting the styles in the DOM.
  insertionPoint: document.getElementById('jss-insertion-point'),
})
