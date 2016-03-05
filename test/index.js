'use strict'

let test = require('tape')
let grovel = require('../index')

let assocIn = function (obj, path, val) { return grovel.assocIn.call(obj, path, val) }
let dissocIn = function (obj, path) { return grovel.dissocIn.call(obj, path) }
let getIn = function (obj, path) { return grovel.getIn.call(obj, path) }
let count = function (obj) { return grovel.count.call(obj) }

test('assocIn', function (t) {
  t.same(assocIn({a: 1}, ['a'], 2), { a: 2 }, 'string key at depth 1')
  t.same(assocIn([1, 2, 3], [1], 8), [ 1, 8, 3 ], 'number key at depth 1')

  t.same(assocIn({}, ['a', 'b', 'c'], 'coucou'), {
    a: {
      b: {
        c: 'coucou'
      }
    }
  }, 'create deep string key structure')

  t.same(assocIn({}, ['a', 0, 'c'], 'coucou'), {
    a: [
      {
        c: 'coucou'
      }
    ]
  }, 'create deep string/number key structure')

  t.same(assocIn({
    a: {
      b: [1, 2]
    }
  }, ['a', 'b', 2], 8), {
    a: {
      b: [1, 2, 8]
    }
  }, 'append to array')

  t.same(assocIn({a: [1, 2]}, ['a', 'c'], 'nice'), {
    a: {
      '0': 1,
      '1': 2,
      c: 'nice'
    }
  }, 'convert to object')

  t.same(assocIn({
    library: {
      games: {}
    }
  }, ['library', 'games'], {
    dashboard: {
      '57348': {
        classification: 'rose'
      }
    }
  }), {
    library: {
      games: {
        dashboard: {
          '57348': {
            classification: 'rose'
          }
        }
      }
    }
  }, 'both kinda nested')

  t.end()
})

test('dissocIn', function (t) {
  t.same(dissocIn({
    a: 1
  }, ['a']), {}, 'string key at depth 1')

  t.same(dissocIn([1, 2, 3], [2]), [1, 2], 'shorten array')

  t.same(dissocIn({a: {b: {c: 'ha!'}}}, ['a', 'b', 'c']), {
    a: {
      b: {}
    }
  })

  t.end()
})

test('getIn', function (t) {
  t.same(getIn({
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

  t.equal(getIn({a: 'b'}, ['a']), 'b')
  t.notOk(getIn({a: 'b'}, ['a', 2, 3, 4, 2]))
  t.notOk(getIn({a: 'b'}, ['a', 'd', 'f', '9']))

  t.end()
})

test('count', function (t) {
  t.same(count([0, 1, 2]), 3)
  t.same(count([1, 2, 3]), 3)
  t.same(count({a: 'a', b: 'b', c: 'c'}), 3)
  t.same(count(null), 0)
  t.same(count(undefined), 0)
  t.same(count(3), 0)

  t.end()
})

// TODO: test actual diff algorithm
test('diff (perf)', function (t) {
  const make_record = (props) => {
    const record = Object.assign({}, props)
    for (let i = 0; i < 600; i++) {
      record['key' + i] = 'oliphant'
    }
    return record
  }

  const a_record = make_record({name: 'Enemy Unknown'})
  const b_record = make_record({name: 'Enemy Within'})

  const old_state = {}

  for (let i = 0; i < 600; i++) {
    old_state['record' + i] = a_record
  }

  const new_state = Object.assign({}, old_state)
  new_state['record' + 300] = b_record

  const diff = grovel.diff.call(old_state, new_state)
  t.same(diff, [
    ['e', ['record300', 'name'], 'Enemy Within']
  ])
  t.end()
})

test('apply', function (t) {
  const state = {
    '42': {id: 42},
    '21': {id: 21},
    '8': {id: 8}
  }
  let saved_state = {}
  let patched_state = {}

  const send_diff = (label) => {
    const diff = grovel.diff.call(saved_state, state)
    saved_state = Object.assign({}, state)
    patched_state = grovel.apply.call(patched_state, diff)
    t.same(patched_state, state, label)
  }

  send_diff('initial')

  state['42'].name = 'Hi!'
  send_diff('add field')

  state['42'].name = 'Bye!'
  send_diff('change field')

  delete state['42'].name
  send_diff('delete field')

  delete state['21']
  send_diff('delete record')

  t.end()
})

// TODO: test more patch operations
test('applyAt', function (t) {
  let state = {
    library: {
      games: {}
    }
  }

  const diff = [
    [
      'e',
      ['dashboard', '50723'],
      {
        name: 'Nino'
      }
    ],
    [
      'e',
      ['dashboard', '50724'],
      {
        name: 'Whip'
      }
    ]
  ]
  state = grovel.applyAt.call(state, diff, ['library', 'games'])

  t.same(state, {
    library: {
      games: {
        dashboard: {
          '50723': {name: 'Nino'},
          '50724': {name: 'Whip'}
        }
      }
    }
  })

  t.end()
})
