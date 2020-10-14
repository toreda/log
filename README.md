# `@toreda/log` - Dynamic Logger

![Toreda](https://content.toreda.com/logo/toreda-logo.png)

![CI](https://github.com/toreda/log/workflows/CI/badge.svg?branch=master) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=toreda_log&metric=coverage)](https://sonarcloud.io/dashboard?id=toreda_log) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=toreda_log&metric=alert_status)](https://sonarcloud.io/dashboard?id=toreda_log)

Lightweight and flexible TypeScript logger for node, web, and serverless environments. Write custom transports to filter and processes log output. The extremely small package footprint is ideal for webacking or bundling `@toreda/log` for live deployment.

# Contents
* [**Usage**](#usage)

* [**Package**](#Package)
	-	[Install](#Install)
	-	[Run Tests](#run-tests)
	-	[Build](#build-from-source)
	-   [License](#license)

# Usage


## Typescript

**Import Logger**
```typescript
import {Logger, LogTransport, LogLevels} from '@toreda/log';
```

**Create Logger Instance**

```typescript
const myLogger = new Log();
const myLoggerWithOptions = new Log({
	id: 'myLoggerId'
})
```



**Create new `LogTransport`**
```typescript
// Create a new LogTransport that outputs to console
const myTransport = new LogTransport(LogTransport.logToConsole) // random id
const myTransportWithOptions = new LogTransport(LogTransport.logToConsole, {
	id: 'myTransportId'
})
```



**Create `LogTransport` with random id that outputs to file**

```typescript
import {appendFileSync} from 'fs';
const myTransportToFile = new LogTransport((logMessage)=>{
	return new Promise((resolve, reject) => {
		const message = JSON.stringify(logMessage);
		try {
			appendFileSync(someFilePath, message + ',\n');
			resolve();
		} catch (error) {
			reject(error);
		}
	}).catch((result) => result);
})

// Attach a LogTransport to a logger
myLogger.attachTransport(myTransportToFile); // catches every log, returns {payload: id}
myLogger.attachTransport(myTransport, LogLevel.WARN); // only catches WARN & ERROR logs

const result = myLogger.attachTransport(new LogTransport((msg) => {
	// do something
}, {
	id: 'customTransport'
}
), [LogLevel.ERROR, LogLevel.DEBUG]); // only catches ERROR & DEBUG logs, returns {payload: id}
```



**Remove a `LogTransport`**

```typescript
// Remove a LogTransport
// returns {payload: LogTransport}
myLogger.removeTransport(myTransportToFile);
 // returns {payload: LogTransport}
myLogger.removeTransport(myLogger.getTransportFromId(result.payload)));
```

**Reattach File Logger**
```typescript
// catches all logs expect TRACE
myLogger.attachTransport(myTransportToFile, LogLevels.DEBUG);
```


**Logging messages**

```typescript
myLogger.error('Some error has occured');
myLogger.warn('This is a warning');
myLogger.info(leftHandValue === rightHandValue);
myLogger.debug(leftHandValue, rightHandValue);
myLogger.trace('someFunction called');

myLogger.log(LogLevel.ERROR, 'Same thing as calling myLogger.error' );
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