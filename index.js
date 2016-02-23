'use strict'

function zero (key) {
  if (typeof key === 'number') {
    return []
  } else {
    return {}
  }
}

function assocIn (obj, path, val) {
  pre: { // eslint-disable-line
    Array.isArray(path)
  }

  let key = path.shift()

  let result
  if (Array.isArray(obj)) {
    result = obj.slice()
  } else {
    result = Object.assign({}, obj)
  }

  if (path.length > 0) {
    result[key] = assocIn(result[key] || zero(path[0]), path, val)
  } else {
    result[key] = val
  }

  return result
}

function dissocIn (obj, path) {
  pre: { // eslint-disable-line
    Array.isArray(path)
  }

  let key = path.shift()

  let result
  if (Array.isArray(obj)) {
    result = obj.slice()
  } else {
    result = Object.assign({}, obj)
  }

  if (path.length > 0) {
    result[key] = dissocIn(result[key] || zero(path[0]), path)
  } else {
    delete result[key]
  }
  return result
}

function getIn (obj, path) {
  pre: { // eslint-disable-line
    Array.isArray(path)
  }

  let key = path.shift()

  if (path.length > 0) {
    return getIn(obj[key], path)
  } else {
    return obj[key]
  }
}

module.exports = {
  assocIn,
  dissocIn,
  getIn
}
