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
			console.error(msg.message);
			break;
		case LogLevels.WARN:
			console.warn(msg.message);
			break;
		case LogLevels.INFO:
			console.info(msg.message);
			break;
		case LogLevels.DEBUG:
			console.debug(msg.message);
			break;
		case LogLevels.TRACE:
			console.trace(msg.message);
			break;
		default:
			console.log(msg.message);
			break;
	}

	return true;
}
