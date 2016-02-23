# mimi

A collection of utilities to handle almost-immutable data.

The idea is to be able to do `oldState === newState` or `oldState.a.b.c` ===
`newState.a.b.c` rather than `_.isEqual`. Hence, `assocIn` generates a lot of
shallow copies. Oh well.

