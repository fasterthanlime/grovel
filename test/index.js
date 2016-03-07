'use strict'

const test = require('tape')

const grovel = require('../')

const core = require('../core')
const assocIn = core.assocIn
const getIn = core.getIn
const count = core.count
const dissocIn = core.dissocIn
const updateIn = core.updateIn
const diff = core.diff
const apply = core.apply
const applyAt = core.applyAt

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

test('updateIn', function (t) {
  t.same(updateIn({
    a: 1
  }, ['a'], function (x) { return x + 1 }), {a: 2}, 'single-level depth')

  t.same(updateIn({
    a: [
      0,
      1,
      {
        'b': 2
      }
    ]
  }, ['a', 2, 'b'], function (x) { return x + 1 }), {a: [0, 1, {b: 3}]}, 'single-level depth')

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

  const ops = diff(old_state, new_state)
  t.same(ops, [
    ['e', ['record300', 'name'], 'Enemy Within']
  ], 'applied diff correctly and without deep-comparing all records')
  t.end()
})

test('diff (cloned object)', function (t) {
  const a = {name: 'Henry', lastName: 'Kissinger'}
  const b = Object.assign({}, a)

  const ops = diff(a, b)
  t.same(ops, [], 'empty diff even if !==')
  t.end()
})

test('diff (dates)', function (t) {
  const a = {d: new Date(1995, 11, 17)}
  const b = {d: new Date(1990, 7, 21)}
  t.same(diff(a, b), [
    ['e', ['d'], new Date(1990, 7, 21)]
  ], 'dates with different values')
  t.end()
})

test('diff (null)', function (t) {
  {
    const a = {d: new Date(1995, 11, 17)}
    const b = {d: null}
    t.same(diff(a, b), [
      ['e', ['d'], null]
    ], 'value turns into null')
  }
  {
    const a = {d: null}
    const b = {d: new Date(1995, 11, 17)}
    t.same(diff(a, b), [
      ['e', ['d'], new Date(1995, 11, 17)]
    ], 'value stops being null')
  }
  t.end()
})

test('diff (array)', function (t) {
  {
    const a = {d: [1, 2, 3]}
    const b = {d: [1, 2]}
    t.same(diff(a, b), [
      ['d', ['d', 2]]
    ])
  }
  {
    const a = {d: 'cheese'}
    const b = {d: [1, 2]}
    t.same(diff(a, b), [
      ['e', ['d'], [1, 2]]
    ])
  }
  {
    const a = {d: [8, 7]}
    const b = {d: [8, 7, 6]}
    t.same(diff(a, b), [
      ['e', ['d', 2], 6]
    ])
  }
  t.end()
})

test('diff (regexp)', function (t) {
  const re = /const ([\S+]) = require\(([^)]+)\)/

  {
    const a = {d: 'hello'}
    const b = {d: re}
    t.same(diff(a, b), [
      ['e', ['d'], re]
    ])
  }
  {
    const a = {d: /hi/}
    const b = {d: re}
    t.same(diff(a, b), [
      ['e', ['d'], re]
    ])
  }
  {
    const a = {d: re}
    const b = {d: 'hello'}
    t.same(diff(a, b), [
      ['e', ['d'], 'hello']
    ])
  }
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
    const ops = diff(saved_state, state)
    saved_state = Object.assign({}, state)
    patched_state = apply(patched_state, ops)
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

test('applyAt', function (t) {
  let state = {
    library: {
      games: {
        'collections/123': {
          '70192': {
            name: 'Outline'
          }
        }
      }
    }
  }

  const diff = [
    [
      'e',
      ['dashboard', '50723'],
      {
        name: 'Valet Tycoon'
      }
    ],
    [
      'd',
      ['collections/123', '70192']
    ],
    [
      'e',
      ['dashboard', '50724'],
      {
        name: 'Night in James Woods'
      }
    ]
  ]
  state = applyAt(state, diff, ['library', 'games'])

  t.same(state, {
    library: {
      games: {
        'collections/123': {},
        dashboard: {
          '50723': {name: 'Valet Tycoon'},
          '50724': {name: 'Night in James Woods'}
        }
      }
    }
  })

  t.end()
})

test('bind-friendly variants', function (t) {
  t.same(grovel.assocIn.call({}, ['a', 'b'], 1), {a: {b: 1}}, 'bound assocIn')
  t.same(grovel.dissocIn.call({a: {b: 1}}, ['a', 'b']), {a: {}}, 'bound dissocIn')
  t.same(grovel.diff.call({a: 1}, {a: 2}), [['e', ['a'], 2]], 'bound diff')
  t.same(grovel.apply.call({a: 1}, [['e', ['a'], 2]]), {a: 2}, 'bound apply')
  t.same(grovel.applyAt.call({o: {a: 1}}, [['e', ['a'], 2]], ['o']), {o: {a: 2}}, 'bound applyAt')
  t.same(grovel.getIn.call({o: {a: 1}}, ['o', 'a']), 1, 'bound getIn')
  t.same(grovel.count.call([1, 2, 3]), 3, 'bound count')
  t.same(grovel.updateIn.call([1, 2, 3], [1], function (x) { return x * 2 }), [1, 4, 3], 'bound count')
  t.end()
})
