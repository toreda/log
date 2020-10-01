import {ArmorActionResult} from '@armorjs/action-result';
import {EventEmitter} from 'events';
import {LogListener} from './log-listener';
import {LogMessage} from './log-message';
import {LoggerOptions} from './logger-options';
import {LoggerState} from './logger-state';

export class Logger {
	public state: LoggerState;

	public constructor(options?: LoggerOptions) {
		this.state = this.parseOptions(options);

		this.state.levels.forEach((level) => {
			this[level] = function (...args: any): Logger {
				return this.log.apply(this, [level].concat(args));
			};
		});
	}

	public parseOptions(options: LoggerOptions = {}): LoggerState {
		return {
			events: this.parseOptionsEvents(options.events),
			id: this.parseOptionsId(options.id),
			levels: this.parseOptionsLevels(options.levels),
			listenerNames: [],
			listeners: {}
		};
	}

	public parseOptionsEvents(events?: EventEmitter): EventEmitter {
		if (!events) {
			return new EventEmitter();
		}

		if (!(events instanceof EventEmitter)) {
			return new EventEmitter();
		}

		return events;
	}

	public parseOptionsId(id?: string): string {
		if (typeof id !== 'string') {
			return ('0'.repeat(5) + Math.floor(Math.random() * 99999).toString()).slice(-5);
		}

		return id;
	}

	public parseOptionsLevels(levels?: string[]): string[] {
		let defaultLevels = ['error', 'warn', 'info', 'debug', 'trace'];

		if (!levels) {
			return defaultLevels;
		}

		if (!Array.isArray(levels)) {
			return defaultLevels;
		}

		return levels;
	}

	public parseLevel(level?: number | string): {levelNum: number; levelStr: string} {
		if (level == null) {
			return {
				levelNum: this.state.levels.length - 1,
				levelStr: this.state.levels[this.state.levels.length - 1]
			};
		}

		let levelNum: number;
		let levelStr: string;

		if (typeof level === 'string') {
			levelStr = level;
			levelNum = this.state.levels.findIndex((value) => {
				return value === levelStr;
			});
		} else {
			levelNum = level;
		}

		levelNum = Math.round(levelNum);
		levelNum = Math.max(levelNum, 0);
		levelNum = Math.min(levelNum, this.state.levels.length - 1);
		levelStr = this.state.levels[levelNum];

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
				n = this.state.listenerNames.length.toString();
			}

			listener = new LogListener(this, this.state.events, {level: target, name: n});
		}

		if (this.state.listeners[listener.state.name]) {
			result.fail();
			listener.disable();
			return result;
		}

		this.state.listeners[listener.state.name] = listener;
		this.state.listenerNames.push(listener.state.name);
		result.payload = listener;
		result.succeed();
		return result;
	}

	public chooseListener(target: number | string): LogListener {
		let result: LogListener;
		let name: string;

		if (typeof target === 'number') {
			let num = Math.round(target);
			let max = this.state.listenerNames.length;
			if (Math.abs(num) < max) {
				num = (num + max) % max;
			} else {
				num = num >= 0 ? max - 1 : 0;
			}
			name = this.state.listenerNames[num];
		} else {
			name = target;
		}

		result = this.state.listeners[name];

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
		this.state.listenerNames = this.state.listenerNames.filter((name) => name !== listener.state.name);
		delete this.state.listeners[listener.state.name];
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

		this.state.events.emit('LogEvent', logMessage);

		return this;
	}
}
