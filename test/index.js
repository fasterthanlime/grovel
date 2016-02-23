'use strict'

let test = require('tape')
let mimi = require('../index')

test('assocIn', function (t) {
  t.same(mimi.assocIn({a: 1}, ['a'], 2), { a: 2 }, 'string key at depth 1')
  t.same(mimi.assocIn([1, 2, 3], [1], 8), [ 1, 8, 3 ], 'number key at depth 1')

  t.same(mimi.assocIn({}, ['a', 'b', 'c'], 'coucou'), {
    a: {
      b: {
        c: 'coucou'
      }
    }
  }, 'create deep string key structure')

  t.same(mimi.assocIn({}, ['a', 0, 'c'], 'coucou'), {
    a: [
      {
        c: 'coucou'
      }
    ]
  }, 'create deep string/number key structure')

  t.same(mimi.assocIn({
    a: {
      b: [1, 2]
    }
  }, ['a', 'b', 2], 8), {
    a: {
      b: [1, 2, 8]
    }
  }, 'append to array')

  t.same(mimi.assocIn({a: [1, 2]}, ['a', 'c'], 'nice'), {
    a: {
      '0': 1,
      '1': 2,
      c: 'nice'
    }
  }, 'convert to object')

  t.end()
})

test('dissocIn', function (t) {
  t.same(mimi.dissocIn({
    a: 1
  }, ['a']), {}, 'string key at depth 1')

  t.same(mimi.dissocIn([1, 2, 3], [2]), [1, 2], 'shorten array')

  t.same(mimi.dissocIn({a: {b: {c: 'ha!'}}}, ['a', 'b', 'c']), {
    a: {
      b: {}
    }
  })

  t.end()
})

test('getIn', function (t) {
  t.same(mimi.getIn({
    a: [
      1,
      {
        b: [
          1,
          2,
          {
            c: 'hello!'
          }
        ]
      }
    ]
  }, ['a', 1, 'b', 2, 'c']), 'hello!', 'deep')

  t.end()
})

test('')
