# ArmorJS - Log

![CI](https://github.com/toreda/log/workflows/CI/badge.svg?branch=master) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=toreda_log&metric=coverage)](https://sonarcloud.io/dashboard?id=toreda_log) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=toreda_log&metric=alert_status)](https://sonarcloud.io/dashboard?id=toreda_log)

@toreda/log provides a lightweight and flexible logging typescript + javascript package that runs in node, web, and serverless environments. Use built-in logging, or write your own log handlers. Control when and how log messages are generated and send them anywhere.

## Contents

-   [About ArmorJS](#about-armorjs)
-   [Installation](#Installation)
-   [Usage](#usage)
-   [Build](#build)
-   [Testing](#testing)
-   [License](#license)

## About ArmorJS

ArmorJS solves unique challenges in the enterprise node ecosystem. Auditing projects for security, reliability, and even license compatibility are monumental tasks when a project includes thousands of frequently changing dependencies.

## Install

**_With yarn (preferred):_**
`yarn add @toreda/log`

With NPM:
`npm install @toreda/log`

## Usage

### Library Usage

#### Typescript

```
import {Logger, LogTransport, LogLevels} from '@toreda/log';

// Create a new Logger
const myLogger = new Logger();
const myLoggerWithOptions = new Logger({
	id: 'myLoggerId'
})

// Create a new LogTransport that outputs to console
const myTransport = new LogTransport(LogTransport.logToConsole) // random id
const myTransportWithOptions = new LogTransport(LogTransport.logToConsole, {
	id: 'myTransportId'
})

// Create a new LogTransport with a random id that outputs to file
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

// Remove a LogTransport
myLogger.removeTransport(myTransportToFile); // returns {payload: LogTransport}
myLogger.removeTransport(myLogger.getTransportFromId(result.payload))); // returns {payload: LogTransport}


// Reattach File Logger
myLogger.attachTransport(myTransportToFile, LogLevels.DEBUG); // catches all logs expect TRACE

// Log using Logger
myLogger.error('Some error has occured');
myLogger.warn('This is a warning');
myLogger.info(leftHandValue === rightHandValue);
myLogger.debug(leftHandValue, rightHandValue);
myLogger.trace('someFunction called');

myLogger.log(LogLevel.ERROR, 'Same thing as calling myLogger.error' );
```

#### Node

```
const Logger = require('@toreda/log');
```

## Build

Build (or rebuild) the log package:

**_With Yarn (preferred):_**

```
yarn install
yarn build
```

With NPM:

```
npm install
npm run-script build
```

## Testing

Log implements unit tests using jest. Run the following commands from the directory where log has been installed.

**_With yarn (preferred):_**

```
yarn install
yarn test
```

With NPM:

```
npm install
npm run-script test
```

## License

[MIT](LICENSE) &copy; Michael Brich
