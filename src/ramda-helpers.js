import validate from 'aproba'
import * as R from 'ramda'
import assert from 'assert'

export const C = R.always
export const I = R.identity

export function overProp(propName) {
  validate('S', arguments)
  return R.over(R.lensProp(propName))
}

export function compose(fns) {
  validate('A', arguments)
  fns.forEach((fn, i) => {
    const argType = typeof fn
    assert(
      argType === 'function',
      `[compose] expected typeof fns[${i}] to be function but found ${argType} , ${fn}`,
    )
  })
  return R.compose(...fns)
}

export function pipe(fns) {
  validate('A', arguments)
  return compose(R.reverse(fns))
}

export function sleep(timeout) {
  validate('N', arguments)
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

export function invariant(cond, message) {
  if (message === void 0) {
    message = 'Illegal state'
  }
  if (!cond) throw new Error('[invariant] ' + message)
}

export function hexColorFromStr(str) {
  validate('S', arguments)
  const hash = R.reduce((acc, char) => {
    const unicode = char.charCodeAt(0)
    return unicode + ((acc << 5) - acc)
  })(0)(str)

  const color = Math.floor(
    Math.abs(((Math.sin(hash) * 10000) % 1) * 16777216),
  ).toString(16)

  return '#' + Array(6 - color.length + 1).join('0') + color
}

export const objFromList = R.curry(function objFromList(fn, list) {
  validate('FA', arguments)
  return R.chain(R.zipObj, R.map(fn))(list)
})

//    mapKeys :: (String -> String) -> Object -> Object
export const mapKeys = R.curry(function mapKeys(fn, obj) {
  validate('FO', arguments)
  return R.fromPairs(R.map(R.adjust(0, fn), R.toPairs(obj)))
})

export const toggleProp = R.curry(function toggleProp(propName, obj) {
  validate('SO', arguments)

  return overProp(propName)(R.not)(obj)
})

// export function log(...args) {
//   const con = console.feed ? console.feed.pointers : console
//   con.log(...args)
// }
export const _idProp = R.prop('_id')

export const mergeDefaults = R.curry(function mergeDefaults(
  def,
  objOrNil,
) {
  validate('OO|OZ', arguments)

  return pipe([R.defaultTo({}), R.mergeDeepRight(def)])(objOrNil)
})

export function toggleLens(ivLens) {
  validate('F', arguments)
  return R.over(ivLens)(R.not)
}

export const objBy = R.curry(function objBy(getKey, note) {
  validate('F*', arguments)

  return R.objOf(getKey(note), note)
})
export const overById = overProp('byId')
