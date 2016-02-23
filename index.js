'use strict'

function zero (key) {
  if (typeof key === 'number') {
    return []
  } else {
    return {}
  }
}

function assocIn (path, val) {
  let key = path[0]

  let result
  if (Array.isArray(this)) {
    result = this.slice()
  } else {
    result = Object.assign({}, this)
  }

  if (path.length > 1) {
    result[key] = assocIn.call(result[key] || zero(path[1]), path.slice(1), val)
  } else {
    result[key] = val
  }

  return result
}

function dissocIn (path) {
  let key = path[0]

  let result
  if (Array.isArray(this)) {
    result = this.slice()
  } else {
    result = Object.assign({}, this)
  }

  if (path.length > 1) {
    result[key] = dissocIn.call(result[key] || zero(path[1]), path.slice(1))
  } else {
    delete result[key]
  }
  return result
}

function getIn (path) {
  let key = path[0]

  if (path.length > 1) {
    return getIn.call(this[key], path.slice(1))
  } else {
    return this[key]
  }
}

function count () {
  try {
    return Object.keys(this).length
  } catch (e) {
    return 0
  }
}

module.exports = {
  assocIn,
  dissocIn,
  getIn,
  count
}
