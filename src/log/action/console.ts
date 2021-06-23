import {LogLevels} from '../levels';
import {LogMessage} from '../message';

/**
 * Action intended for development and debugging where console
 * logs may be needed.
 * @param msg
 */

export async function LogActionConsole(msg: LogMessage): Promise<boolean> {
	switch (msg.level) {
		case LogLevels.ERROR:
			console.error('[ERROR]', msg.message);
			break;
		case LogLevels.WARN:
			console.warn('[WARN]', msg.message);
			break;
		case LogLevels.INFO:
			console.info('[INFO]', msg.message);
			break;
		case LogLevels.DEBUG:
			console.debug('[DEBUG]', msg.message);
			break;
		case LogLevels.TRACE:
			console.trace('[TRACE]', msg.message);
			break;
		default:
			console.log(`[${msg.level}]`, msg.message);
			break;
	}

	return true;
}
