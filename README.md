![Toreda](https://content.toreda.com/logo/toreda-logo.png)

[![CI](https://img.shields.io/github/actions/workflow/status/toreda/log/main.yml?branch=master&style=for-the-badge)](https://github.com/toreda/log/actions) [![GitHub issues](https://img.shields.io/github/issues/toreda/log?style=for-the-badge)](https://github.com/toreda/log/issues)


[![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/toreda/log/master?style=for-the-badge)](https://github.com/toreda/log/releases/latest)
[![GitHub Release Date](https://img.shields.io/github/release-date/toreda/log?style=for-the-badge)](https://github.com/toreda/log/releases/latest)

[![license](https://img.shields.io/github/license/toreda/log?style=for-the-badge)](https://github.com/toreda/log/blob/master/LICENSE)


# `@toreda/log` - TypeScript Logger

TypeScript logger with custom transports, per-group log levels, and ESM + CommonJS builds for Node, browser, and serverless environments.

Features:
* Custom transports receive structured log messages, filtered by log level and group.
* Per-group log levels, so debug output can be enabled for one system without app-wide noise.
* Log levels can be changed at runtime without a code push.
* Ships both ESM and CommonJS builds, with type declarations for each.
* Written in TypeScript with full type definitions.
* Works in Node, browser, and serverless environments.

&nbsp;

# Contents
* [**Features**](#features)

* [**Usage**](#usage)

* [**Package**](#Package)
	-	[Install](#Install)
	-	[Run Tests](#run-tests)
	-	[Build](#build-from-source)
	-   [License](#license)

&nbsp;

# Features

## Custom Transports
* Configure transports to receive all log events, or only a filtered subset based on class, group, and log level.
* Custom transports can filter and receive structured log data for specific events you care about. Get the exact functionality you need without writing a whole library.

## Granular Control
* Leave disabled log messages in prod environments which can be turned on later for debugging without a code push.
* Set log levels for individual functions, classes, and groups. See debug output from the system you're debugging without seeing app-wide debug spam.

&nbsp;

# Usage
`@toreda/log` provides simple and straight forward logging for common use cases, and advanced functionality for use in more complicated situations like server-side and remote debugging.


**Create Logger** (no options)
```typescript
import {Log} from '@toreda/log';
const log = new Log();
```


**Log Levels**
```typescript
import {Log, Levels} from '@toreda/log';
const log = new Log({globalLevel: Levels.DEBUG});
// Change log level:
log.setGlobalLevel(Levels.ALL);
// Disable a specific log level only
log.disableGlobalLevel(Levels.TRACE)
// Disable specific log levels only
log.disableGlobalLevels([Levels.DEBUG, Levels.INFO])
// Enable a specific log level only
log.enableGlobalLevel(Levels.DEBUG)
// Enable specific log levels only
log.enableGlobalLevels([Levels.TRACE, Levels.INFO])
// Trace
log.trace('Trace message here');
// Debug
log.debug('Debug message here');
// Info
log.info('Info message here');
// Warn
log.warn('Warn message here');
// Error
log.error('my', 'message', 'here');
// Multple
log.log(Levels.ERROR | Levels.TRACE, 'trace and error message here');
// Custom
const customLevel =
log.log(0b0010_0000_0000, 'custom logging level');
```

**Level Keys**

Every level argument also accepts a `LevelKey` string in place of the bitmask, or an array
mixing keys and bitmasks. Keys map to the `Levels` enum: `'none'`, `'error'`, `'warn'`,
`'info'`, `'debug'`, `'trace'`, `'all'`, `'all_custom'`, `'all_extended'`. Levels are still
stored as bitmasks internally, so keys and bitmasks can be used interchangeably.
```typescript
import {Log, Levels, levelMask} from '@toreda/log';
const log = new Log({globalLevel: 'debug'});
// Same as log.setGlobalLevel(Levels.ALL)
log.setGlobalLevel('all');
// Disable a single level by key
log.disableGlobalLevel('trace');
// Arrays are applied one item at a time, in order. Keys and bitmasks can be mixed.
log.disableGlobalLevel(['debug', Levels.INFO]);
log.enableGlobalLevels(['trace', 'info']);
// set and log combine an array into a single bitmask
log.setGroupLevel(['error', 'warn']);
log.log(['error', 'trace'], 'trace and error message here');
// Transports and groups accept keys too
log.addTransport({id: 'errors', level: 'error', action});
const subLog = log.make('sublog', {level: ['warn', 'error']});
// Translate a key, bitmask, or array to its bitmask. Returns null when invalid.
levelMask('debug'); // Levels.DEBUG
levelMask(['error', 'warn']); // Levels.ERROR | Levels.WARN
levelMask('fatal'); // null
```

**Groups**
New logs can be created from existing logs. The new logs share a state with
the log that created them and have an id that tracks the origin of of the log.
```typescript
import {Log} from '@toreda/log';
const log = new Log({id: 'ClassLog'});
const subLog = log.make('FunctionLog');

// Message has id 'ClassLog'
log.info('Class constructor started.');
// Message has id 'ClassLog.FunctionLog'
subLog.info('Function call started.');

log.globalState === subLog.globalState; // returns true
```


**Transports**
Transports attach to logs and handle the messages.

A default transport that logs to console can be actived when creating the log.
```typescript
import {Log} from '@toreda/log';
const log = new Log({consoleEnabled: true});
const sublog = log.make('sublog');

// Logs to the console
log.info('Info Message');
// Logs to the console
sublog.info('Info Message');
```

It can also be activated later
```typescript
import {Log} from '@toreda/log';
const log = new Log();
log.activateDefaultConsole();
const sublog = log.make('sublog');

// Logs to the console
log.info('Info Message');
// Does not log to the console
sublog.info('Info Message');
```

Custom transports can also be created
```typescript
import {Log, LogMessage, Transport} from '@toreda/log';
const log = new Log();
// Example dummy example.
// Custom actions can perform any async activity.
const action = async (msg: LogMessage): Promise<boolean> => {
   return true;
}
// Transports take a string ID, initial log level,
// and async action function.
const transport = new Transport('tid1', LogLevels.ALL, action);

// Add transport to global listeners.
log.addTransport(transport);
```

**Removing Transports**
```typescript
// Remove the same transport
// NOTE: Requires access to original transport object
// now being removed.
log.removeTransport(transport);

// Remove global transport by ID.
// Use ID to remove global transports if you no
// longer have a reference to target transport.
log.removeTransportById('tid1');
```

&nbsp;

# Install
Install `@toreda/log` directly from NPM.

## Install with Yarn (preferred)
```bash
yarn add @toreda/log --dev
```

## Install using NPM
```bash
npm install @toreda/log --save-dev
```


## Run Tests
Install or clone `@toreda/log` [(see above)](#install).

Toreda Unit Tests use [Jest](https://jestjs.io/).

Installing jest is not required after project dependencies are installed ([see above](#install)).
```bash
yarn test
```

&nbsp;

# Build from source

The next steps are the same whether you installed the package using NPM or cloned the repo from Github.

### Build with Yarn
 Enter the following commands in order from the log project root.
```bash
yarn build
```

### Build with NPM
 Enter the following commands in order from the log project root.
```bash
npm run-script build
```

&nbsp;
# Legal

## License
[MIT](LICENSE) &copy; Toreda, Inc.


## Copyright
Copyright &copy; 2019 - 2023 Toreda, Inc. All Rights Reserved.

https://www.toreda.com
