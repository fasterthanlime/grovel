
/**
 * returns the zero-value for a given key type
 * quite simplistic, but works well enough for mori-like assocIn etc.
 */
function zeroValue (key) {
  if (typeof key === 'number') {
    return []
  } else {
    return {}
  }
}

/**
 * utility function that really shouldn't exist but helps
 * deepDiff makes informed decisions about whether or not
 * some piece of data really changed
 */
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

module.exports = {
  zeroValue, realTypeOf
}
