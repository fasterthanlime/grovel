'use strict'

function zero (key) {
  if (typeof key === 'number') {
    return []
  } else {
    return {}
  }
}

function assocIn (path, val) {
  let key = path.shift()

  let result
  if (Array.isArray(this)) {
    result = this.slice()
  } else {
    result = Object.assign({}, this)
  }

  if (path.length > 0) {
    result[key] = assocIn.call(result[key] || zero(path[0]), path, val)
  } else {
    result[key] = val
  }

  return result
}

function dissocIn (path) {
  let key = path.shift()

  let result
  if (Array.isArray(this)) {
    result = this.slice()
  } else {
    result = Object.assign({}, this)
  }

  if (path.length > 0) {
    result[key] = dissocIn.call(result[key] || zero(path[0]), path)
  } else {
    delete result[key]
  }
  return result
}

function getIn (path) {
  let key = path.shift()

  if (path.length > 0) {
    return getIn.call(this[key], path)
  } else {
    return this[key]
  }
}

module.exports = {
  assocIn,
  dissocIn,
  getIn
}
