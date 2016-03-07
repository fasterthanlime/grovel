'use strict'

const util = require('./util')

function assocIn (subject, path, val) {
  const key = path[0]

  let result
  if (Array.isArray(subject)) {
    result = subject.slice()
  } else {
    result = Object.assign({}, subject)
  }

  if (path.length > 1) {
    result[key] = assocIn(result[key] || util.zeroValue(path[1]), path.slice(1), val)
  } else {
    result[key] = val
  }

  return result
}

function dissocIn (subject, path) {
  const key = path[0]

  let result
  if (Array.isArray(subject)) {
    result = subject.slice()
  } else {
    result = Object.assign({}, subject)
  }

  if (path.length > 1) {
    result[key] = dissocIn(result[key] || util.zeroValue(path[1]), path.slice(1))
  } else {
    delete result[key]
  }
  return result
}

function getIn (subject, path) {
  if (!subject) {
    return null
  }
  const key = path[0]

  if (path.length > 1) {
    return getIn(subject[key], path.slice(1))
  } else {
    return subject[key]
  }
}

function count (subject) {
  if (subject && typeof subject === 'object') {
    return Object.keys(subject).length
  } else {
    return 0
  }
}

/**
 * Heavily inspired by https://www.npmjs.com/package/deep-diff
 * With these notable differences:
 *   - smaller output
 *   - lhs not included in output
 *   - fewer cases handled
 *   - runs faster (because it's simpler)
 * The diff format returned by `deepDiff` is compatible with `apply`
 */
function deepDiff (lhs, rhs, changes, path, key) {
  const currentPath = key ? path.concat([key]) : path
  const ltype = typeof lhs
  const rtype = typeof rhs
  if (ltype === 'undefined') {
    if (rtype !== 'undefined') {
      changes(['e', currentPath, rhs])
    }
  } else if (rtype === 'undefined') {
    changes(['d', currentPath])
  } else {
    const rltype = util.realTypeOf(ltype, lhs)
    const rrtype = util.realTypeOf(rtype, rhs)
    if ((rltype !== rrtype) ||
        (rltype === 'date' && rrtype === 'date' && ((lhs - rhs) !== 0)) ||
        (rltype === 'regexp' && rrtype === 'regexp' && (lhs.toString() !== rhs.toString()))) {
      changes(['e', currentPath, rhs])
    } else if (lhs !== rhs) {
      if (ltype === 'object' && lhs != null && rhs != null) {
        // bit of ugliness that allows us to share the same codepath
        // between arrays and objects.
        const asKey = (rrtype === 'array') ? function (x) { return ~~x } : function (x) { return x }

        const pkeys = Object.keys(rhs)
        for (const k in lhs) {
          if (!lhs.hasOwnProperty(k)) { continue }
          if (rhs.hasOwnProperty(k)) {
            pkeys.splice(pkeys.indexOf(k), 1)
            deepDiff(lhs[k], rhs[k], changes, currentPath, asKey(k))
          } else {
            deepDiff(lhs[k], undefined, changes, currentPath, asKey(k))
          }
        }

        for (const k of pkeys) {
          deepDiff(undefined, rhs[k], changes, currentPath, asKey(k))
        }
      } else if (!(ltype === 'number' && isNaN(lhs) && isNaN(rhs))) {
        changes(['e', currentPath, rhs])
      }
    }
  }
}

function diff (lhs, rhs) {
  const changes = []
  deepDiff(lhs, rhs, (change) => {
    if (change) { changes.push(change) }
  }, [], undefined)
  return changes
}

function apply (state, ops) {
  for (const el of ops) {
    switch (el[0]) {
      // edited element
      case 'e': {
        state = assocIn(state, el[1], el[2])
        break
      }

      // deleted element
      case 'd': {
        state = dissocIn(state, el[1])
        break
      }
    }
  }

  return state
}

function applyAt (state, diff, path) {
  const original = getIn(state, path)
  const patched = apply(original, diff)
  return assocIn(state, path, patched)
}

module.exports = {
  assocIn,
  dissocIn,
  getIn,
  count,
  diff,
  apply,
  applyAt
}
