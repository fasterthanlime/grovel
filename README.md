# grovel

[![Build Status](https://travis-ci.org/fasterthanlime/grovel.svg?branch=master)](https://travis-ci.org/fasterthanlime/grovel)

A collection of utilities to handle almost-immutable data.

The idea is to be able to do `oldState === newState` or `oldState.a.b.c` ===
`newState.a.b.c` rather than `_.isEqual`. Hence, `assocIn` generates a lot of
shallow copies. Oh well.

