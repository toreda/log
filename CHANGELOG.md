# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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



[unreleased]: https://github.com/toreda/log/compare/v0.0.0...HEAD