# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-09-16

### Headlines
* Added dual esm/cjs output to support ESM consumers.

### Changed
* `Log.addTransport` now returns a `TransportAddResult` object (`{ok, errorCode?, errors?}`) instead of a boolean, and never throws. Transport construction failures are reported with `errorCode: 'transport_init_failed'` and the thrown error in `errors`.
* `Transport` ctor now throws when `level` is not a valid log level instead of silently defaulting to `Levels.NONE`.

### Fixed
* startingGroups now runs at the end of the Log ctor and no longer throws when provided.
* `make('a.b')` no longer creates a group keyed `root.a.b` whose parent is `root` instead of `root.a`, which collided with `root.make('a').make('b')`. Group ids and parents now always match the full hierarchy.
* Ids that are whitespace-only or contain an empty segment (`'a..b'`, `'.a'`) now return `null` instead of creating a group with a malformed id.

### Added
* `Log.make(id, options?)` replaces `makeLog` as the way to get or create a child log group. `makeLog` remains as a deprecated alias that calls `make`, so existing call sites keep working.
* A dotted id walks the hierarchy one segment at a time, so `root.make('a.b')` returns the same log as `root.make('a').make('b')` and creates missing intermediate groups.
* `LevelKey` string union (`'none' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'all' | 'all_custom' | 'all_extended'`) is accepted anywhere a level bitmask is: `Log` level methods, `Log.log`, `LogLevel`, `Transport`, and the `globalLevel`/`level` options. Levels are still stored and compared as bitmasks internally.
* Level arguments also accept an array mixing keys and bitmasks. `enableLevel`/`disableLevel` style methods resolve each item to its bitmask and apply it in order, one at a time. `set`, `log`, and constructors combine the array with bitwise OR into a single mask.
* `LevelKeys` map from key to bitmask, `LevelInput` type (`number | LevelKey`), `checkLevelKey` type guard, and `levelMask` helper that resolves a key, bitmask, or array to a bitmask, or `null` when any input is invalid.

## [0.6.11] - 2022-01-03
### Updated
- All direct NPM dependencies updated to latest.

## [0.5.0] - 2021-07-02
### Added
- `Log` class is the main access point. Directs the logging.
- `Transport` class converts the messages from `Log` into the desired output.
- `Levels` enum for convenience when choosing logging level.
- `StrongLevel` class uses `StrongType` to guarentee level property is valid.
- `Log` can be used to create child a `Log` that shares a state and has a derivative id.


## [0.1.0]
### Added
- Initial early release. Project API is not stable until v1.0.0.



[unreleased]: https://github.com/toreda/log/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/toreda/log/compare/v0.6.11...v1.0.0
