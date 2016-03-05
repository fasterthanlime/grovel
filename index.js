'use strict'

function zero (key) {
  if (typeof key === 'number') {
    return []
  } else {
    return {}
  }
}

function _assocIn (subject, path, val) {
  const key = path[0]

  let result
  if (Array.isArray(subject)) {
    result = subject.slice()
  } else {
    result = Object.assign({}, subject)
  }

  if (path.length > 1) {
    result[key] = _assocIn(result[key] || zero(path[1]), path.slice(1), val)
  } else {
    result[key] = val
  }

  return result
}

function assocIn (path, val) {
  return _assocIn(this, path, val)
}

function _dissocIn (subject, path) {
  const key = path[0]

  let result
  if (Array.isArray(subject)) {
    result = subject.slice()
  } else {
    result = Object.assign({}, subject)
  }

  if (path.length > 1) {
    result[key] = _dissocIn(result[key] || zero(path[1]), path.slice(1))
  } else {
    delete result[key]
  }
  return result
}

function dissocIn (path) {
  return _dissocIn(this, path)
}

function _getIn (subject, path) {
  if (!subject) {
    return null
  }
  const key = path[0]

  if (path.length > 1) {
    return _getIn(subject[key], path.slice(1))
  } else {
    return subject[key]
  }
}

function getIn (path) {
  return _getIn(this, path)
}

function count () {
  if (this && typeof this === 'object') {
    return Object.keys(this).length
  } else {
    return 0
  }
}

function realTypeOf (type, subject) {
  if (type !== 'object') {
    return type
  }

  if (subject === null) {
    return 'null'
  } else if (Array.isArray(subject)) {
    return 'array'
  } else if (subject instanceof Date) {
    return 'date'
  } else if (subject === RegExp(subject)) {
    return 'regexp'
  }
}

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
    const rltype = realTypeOf(ltype, lhs)
    const rrtype = realTypeOf(rtype, rhs)
    if ((rltype !== rrtype) ||
        (rltype === 'date' && rrtype === 'date' && ((lhs - rhs) !== 0))) {
      changes(['e', currentPath, rhs])
    } else if (lhs !== rhs) {
      if (ltype === 'object' && lhs != null && rhs != null) {
        const pkeys = Object.keys(rhs)
        for (const k in lhs) {
          if (!lhs.hasOwnProperty(k)) { continue }
          if (rhs.hasOwnProperty(k)) {
            pkeys.splice(pkeys.indexOf(k), 1)
            deepDiff(lhs[k], rhs[k], changes, currentPath, k)
          } else {
            deepDiff(lhs[k], undefined, changes, currentPath, k)
          }
        }

        for (const k of pkeys) {
          deepDiff(undefined, rhs[k], changes, currentPath, k)
        }
      } else if (!(ltype === 'number' && isNaN(lhs) && isNaN(rhs))) {
        changes(['e', currentPath, rhs])
      }
    }
  }
}

function _diff (lhs, rhs) {
  const changes = []
  deepDiff(lhs, rhs, (change) => {
    if (change) { changes.push(change) }
  }, [], undefined)
  return changes
}

function diff (rhs) {
  return _diff(this, rhs)
}

function _apply (state, diff) {
  for (const el of diff) {
    switch (el[0]) {
      // edited element
      case 'e': {
        state = _assocIn(state, el[1], el[2])
        break
      }

      // deleted element
      case 'd': {
        state = _dissocIn(state, el[1])
        break
      }
    }
  }

  return state
}

function apply (diff) {
  return _apply(this, diff)
}

function _applyAt (state, diff, path) {
  const original = _getIn(state, path)
  const patched = _apply(original, diff)
  return _assocIn(state, path, patched)
}

function applyAt (diff, path) {
  return _applyAt(this, diff, path)
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
