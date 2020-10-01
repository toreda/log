import {ArmorActionResult} from '@armorjs/action-result';
import {EventEmitter} from 'events';
import {LogListener} from './log-listener';
import {LogMessage} from './log-message';
import {LogOptions} from './log-options';
import {LogState} from './log-state';

export class Logger {
	public events: EventEmitter;
	public levels: string[];
	public listeners: {[name: string]: LogListener};
	public listenerNames: string[];

	public constructor(events?: EventEmitter, options?: LogOptions) {
		this.listeners = {};
		this.listenerNames = [];

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

	public attachListener(target?: number | string | LogListener, name?: string): ArmorActionResult {
		const result = new ArmorActionResult();

		let listener: LogListener;

		if (target instanceof LogListener) {
			listener = target;
		} else {
			let n = name;
			if (name == null) {
				n = this.listenerNames.length.toString();
			}

			listener = new LogListener(this.events, this, target, n);
		}

		if (this.listeners[listener.name]) {
			result.fail();
			listener.disable();
			return result;
		}

		this.listeners[listener.name] = listener;
		this.listenerNames.push(listener.name);
		result.payload = listener;
		result.succeed();
		return result;
	}

	public chooseListener(target: number | string): LogListener {
		let result: LogListener;
		let name: string;

		if (typeof target === 'number') {
			let num = Math.round(target);
			let max = this.listenerNames.length;
			if (Math.abs(num) < max) {
				num = (num + max) % max;
			} else {
				num = num >= 0 ? max - 1 : 0
			}
			name = this.listenerNames[num];
		} else {
			name = target;
		}

		result = this.listeners[name];

		return result;
	}

	public removeListener(target: number | string | LogListener): ArmorActionResult {
		const result = new ArmorActionResult();

		if (target == null) {
			result.fail();
			return result;
		}

		let listener: LogListener;

		if (target instanceof LogListener) {
			listener = target;
		} else {
			listener = this.chooseListener(target);
		}

		if (!listener) {
			result.fail();
			return result;
		}

		listener.disable();
		this.listenerNames = this.listenerNames.filter((name) => name !== listener.name);
		delete this.listeners[listener.name];
		result.payload = listener;
		result.succeed();
		return result;
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
