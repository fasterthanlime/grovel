# grovel

[![Build Status](https://travis-ci.org/fasterthanlime/grovel.svg?branch=master)](https://travis-ci.org/fasterthanlime/grovel)
[![Coverage Status](https://coveralls.io/repos/github/fasterthanlime/grovel/badge.svg?branch=master)](https://coveralls.io/github/fasterthanlime/grovel?branch=master)
[![Maintainer status](https://img.shields.io/badge/maintained%3F-no!-red.svg?style=flat)]

**Disclaimer: this library is tailor-made for another project. No attempt will be made
to spin it into its own project / PRs with new features will be ignored.**

A collection of utilities to handle almost-immutable data.

The idea is to be able to do `oldState === newState` or `oldState.a.b.c` ===
`newState.a.b.c` rather than `_.isEqual`. Hence, `assocIn` generates a lot of
shallow copies. Oh well.

## Usage

The recommended way to use grovel is to use babel with function binding,
which allows you to write code like this:

```javascript
import {assocIn, getIn} from 'grovel'

function doSomething () {
  const a = {}::assocIn(['earth', 'france', 'cheese'], 'camembert')
  const france = a::getIn(['earth', 'france'])
  assert.same(france, {cheese: 'camembert'})

  const b = a::assocIn(['earth', 'england', 'cheese'], 'cheddar')
  assert.same(england, {cheese: 'cheddar'})

  const france2 = b::getIn(['earth', 'france'])
  assert(france2 === france)
}
```
