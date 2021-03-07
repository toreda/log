
# `@toreda/log` - Dynamic Logger

![Toreda](https://content.toreda.com/logo/toreda-logo.png)

![CI](https://github.com/toreda/log/workflows/CI/badge.svg?branch=master) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=toreda_log&metric=coverage)](https://sonarcloud.io/dashboard?id=toreda_log) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=toreda_log&metric=alert_status)](https://sonarcloud.io/dashboard?id=toreda_log)

Light TypeScript logger for node, web, and serverless environments. 

Features:
* Custom Transports
* Small footprint
* Browser Compatible
* Serverless Compatible
* TypeScript first

# Contents
* [**Usage**](#usage)

* [**Package**](#Package)
	-	[Install](#Install)
	-	[Run Tests](#run-tests)
	-	[Build](#build-from-source)
	-   [License](#license)

# Usage


## Typescript

**Import and create Logger**
```typescript
import {Log, LogLevels} from '@toreda/log';
const log = new Log();
```

**Log Levels**
```typescript
import {Log, LogLevels} from '@toreda/log';
const log = new Log();
// Change log level:
log.setGlobalLevel(LogLevels.ALL);
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
```
**Global Transports**
Global Log Transports receive all log messages with matching active log levels, for all log groups. 

```typescript
import {Log, LogLevels} from '@toreda/log';
const log = new Log();

// Example dummy example.
// Custom actions can perform any async activity.
const action = async (msg: LogMessage): Promise<void> => {
   return true;
}
// Transports take a string ID, initial log level,
// and async action function.
const transport = new LogTransport('tid1', LogLevels.ALL, action);

// Add transport to global listeners.
log.addGlobalTransport(transport);
```


**Removing Global Transports**

```typescript
// Remove the same transport
// NOTE: Requires access to original transport object
// now being removed.
log.removeGlobalTransport(transport);

// Remove global transport by ID.
// Use ID to remove global transports if you no
// longer have a reference to target transport.
log.removeGlobalTransportById('tid1');
```


# Package

## Install
Install `@toreda/log` directly from NPM.

### Install with Yarn (preferred)
```bash
yarn add @toreda/log --dev
```

### Install using NPM
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

# License

[MIT](LICENSE) &copy; Toreda, Inc.