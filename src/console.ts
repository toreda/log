import {Levels} from './levels';
import {Message} from './message';

/**
 * Action intended for development and debugging where console
 * logs may be needed.
 * @param msg
 */

export function logToConsole(msg: Message): boolean {
	const path = msg.path.join('.');

	switch (msg.level) {
		case Levels.ERROR:
			console.error(`[ERROR][${path}]`, ...msg.message);
			break;
		case Levels.WARN:
			console.warn(`[WARN][${path}]`, ...msg.message);
			break;
		case Levels.INFO:
			console.info(`[INFO][${path}]`, ...msg.message);
			break;
		case Levels.DEBUG:
			console.debug(`[DEBUG][${path}]`, ...msg.message);
			break;
		case Levels.TRACE:
			console.trace(`[TRACE][${path}]`, ...msg.message);
			break;
		default:
			console.log(`[${path}][${msg.level}]`, ...msg.message);
			break;
	}

	return true;
}
