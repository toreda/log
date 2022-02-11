import {Levels} from '../src/levels';
import {Log} from '../src/log';
import {Transport} from '../src/transport';
import {appendFileSync} from 'fs';

// Create a new Logger
const log = new Log({
	id: 'myApp'
});

// Creates a transport that logs to the console
log.activateDefaultConsole();

// Create a log that extends the old log
const classLog = log.makeLog('className');

const fsTransport = new Transport('logFile', Levels.ERROR, (logMessage) => {
	return new Promise((resolve, reject) => {
		const message = JSON.stringify(logMessage);
		try {
			appendFileSync(someFilePath, message + ',\n');
			resolve();
		} catch (error) {
			reject(error);
		}
	}).catch((result) => result);
});

// Add a Transport to a log
classLog.addTransport(fsTransport);

// Remove a LogTransport
classLog.removeTransport(fsTransport);

classLog.error('Some error has occured');
log.info('info level msg');
classLog.warn('This is a warning');
log.log(Levels.ALL, 'all built-in levels msg');
classLog.trace('someFunction called');
