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