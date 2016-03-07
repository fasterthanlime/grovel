'use strict'

const core = require('./core')

function assocIn (path, val) {
  return core.assocIn(this, path, val)
}

function dissocIn (path) {
  return core.dissocIn(this, path)
}

function updateIn (path, f) {
  return core.updateIn(this, path, f)
}

function getIn (path) {
  return core.getIn(this, path)
}

function count () {
  return core.count(this)
}

function diff (rhs) {
  return core.diff(this, rhs)
}

function apply (diff) {
  return core.apply(this, diff)
}

function applyAt (diff, path) {
  return core.applyAt(this, diff, path)
}

module.exports = {
  assocIn,
  dissocIn,
  updateIn,
  getIn,
  count,
  diff,
  apply,
  applyAt
}
