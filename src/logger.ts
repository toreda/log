import {ArmorActionResult} from '@armorjs/action-result';
import {EventEmitter} from 'events';
import {LogListener} from './log-listener';
import {LogMessage} from './log-message';
import {LogOptions} from './log-options';
import {LogState} from './log-state';

export class Logger {
	public events: EventEmitter;
	public levels: string[];
	public listeners: LogListener[];

	public constructor(events?: EventEmitter, options?: LogOptions) {
		this.listeners = [];

		this.events = this.parseEvents(events);

		const state = this.parseOptions(options);

		this.levels = state.levels;

		this.levels.forEach((level) => {
			this[level] = function (...args: any): Logger {
				return this.log.apply(this, [level].concat(args));
			};
		});
	}

	public parseEvents(events?: EventEmitter): EventEmitter {
		if (!events) {
			return new EventEmitter();
		}

		if (!(events instanceof EventEmitter)) {
			return new EventEmitter();
		}

		return events;
	}

	public parseOptions(options?: LogOptions): LogState {
		const state: LogState = {
			levels: ['error', 'warn', 'info', 'debug', 'trace']
		};

		if (options?.levels && Array.isArray(options.levels)) {
			state.levels = options.levels;
		}

		return state;
	}

	public parseLevel(level?: number | string): {levelNum: number; levelStr: string} {
		if (level == null) {
			return {
				levelNum: this.levels.length - 1,
				levelStr: this.levels[this.levels.length - 1]
			};
		}

		let levelNum: number;
		let levelStr: string;

		if (typeof level === 'string') {
			levelStr = level;
			levelNum = this.levels.findIndex((value) => {
				return value === levelStr;
			});
		} else {
			levelNum = level;
		}

		levelNum = Math.round(levelNum);
		levelNum = Math.max(levelNum, 0);
		levelNum = Math.min(levelNum, this.levels.length - 1);
		levelStr = this.levels[levelNum];

		return {
			levelNum: levelNum,
			levelStr: levelStr
		};
	}

	public attachListener(target: number | string | LogListener, name?: string): ArmorActionResult {
		const result = new ArmorActionResult();

		let listener: LogListener;

		if (target instanceof LogListener) {
			listener = target;
		} else {
			const {levelNum, levelStr} = this.parseLevel(target);

			let n = name;
			if (!name) {
				n = this.listeners.length.toString();
			}

			listener = new LogListener(this.events, this, levelNum, levelStr, n);
		}

		if (!listener) {
			result.fail();
			return result;
		}

		if (this.listeners[listener.name]) {
			result.fail();
			listener.disable();
			return result;
		}

		this.listeners[listener.name] = listener;
		result.payload = listener;
		return result;
	}

	public chooseListener(name: number | string): LogListener {
		let result: LogListener;

		result = this.listeners[name];

		return result;
	}

	public removeListener(target: number | string | LogListener): LogListener | null {
		if (target == null) {
			return null;
		}

		let listener: LogListener;

		if (target instanceof LogListener) {
			listener = target;
		} else {
			listener = this.chooseListener(target);
		}

		listener.disable();
		this.listeners[listener.name] = undefined;
		return listener;
	}

	public log(level: number | string, ...args: any[]): Logger {
		const {levelNum, levelStr} = this.parseLevel(level);

		const logMessage: LogMessage = {
			levelNum: levelNum,
			levelStr: levelStr,
			message: args
		};

		this.events.emit('LogEvent', logMessage);

		return this;
	}
}
