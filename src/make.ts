import {LogOptions} from './log/options';
import {Log} from './log';
import {LogLevels} from './log/levels';
import {LogTransport} from './log/transport';
import {ActionResult} from '@toreda/action-result';

export interface Logger {
	(...args: any[]): void;
	trace: (...args: any[]) => void;
	debug: (...args: any[]) => void;
	info: (...args: any[]) => void;
	warn: (...args: any[]) => void;
	error: (...args: any[]) => void;
	attachTransport: (tprt: LogTransport) => ActionResult<LogTransport>;
	reset: () => void;
	typeId: string;
}

export function makeLog(options?: LogOptions): Logger {
	const instance = new Log(options);

	return Object.assign(
		(level: LogLevels, ...args: any[]): void => {
			instance.log(level, ...args);
		},
		{
			trace: (...args: any[]): void => {
				instance.trace(...args);
			},
			debug: (...args: any[]): void => {
				instance.debug(...args);
			},
			info: (...args: any[]): void => {
				instance.info(...args);
			},
			warn: (...args: any[]): void => {
				instance.warn(...args);
			},
			error: (...args: any[]): void => {
				instance.error(...args);
			},
			custom: (level: LogLevels, ...args: any[]): void => {
				instance.log(level, ...args);
			},
			reset: (): void => {
				// empty
			},
			attachTransport(tprt: LogTransport): ActionResult<LogTransport> {
				return instance.attachTransport(tprt);
			},
			typeId: 'log'
		}
	);
}
