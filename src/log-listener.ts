import {EventEmitter} from 'events';
import {LogEvent} from './log-event';
import {LogListenerOptions} from './log-listener-options';
import {LogListenerState} from './log-listener-state';
import {LogMessage} from './log-message';
import {Logger} from './logger';

export class LogListener {
	public events: EventEmitter;
	public parent: Logger;
	public readonly state: LogListenerState;

	constructor(parent: Logger, events: EventEmitter, options?: LogListenerOptions) {
		if (!parent) {
			throw new Error('LogListener init failed - no parent argument provided.');
		}

		if (!(parent instanceof Logger)) {
			throw new Error('LogListener init failed - parent argument not a valid Logger instance.');
		}

		if (!events) {
			throw new Error('LogListener init failed - no events argument provided.');
		}

		if (!(events instanceof EventEmitter)) {
			throw new Error('LogListener init failed - events argument not a valid EventEmitter instance.');
		}

		this.events = events;
		this.parent = parent;

		this.state = this.parseOptions(options);

		this.handleMessage = this.handleMessage.bind(this);
		this.enable();
	}

	public parseOptions(options: LogListenerOptions = {}): LogListenerState {
		return {
			action: this.parseOptionsAction(options.action),
			levelNum: this.parseOptionsLevelNum(options.level),
			levelStr: this.parseOptionsLevelStr(options.level),
			logs: [],
			name: this.parseOptionsName(options.name)
		};
	}

	public parseOptionsAction(action?: LogEvent): LogEvent {
		if (typeof action !== 'function') {
			return (message) => {
				console.log(message);
			};
		}

		return action;
	}

	public parseOptionsLevelNum(level?: number | string): number {
		let defaultLevelNum = this.parent.parseLevel(0).levelNum;

		if (level == null) {
			return defaultLevelNum;
		}

		return this.parent.parseLevel(level).levelNum;
	}

	public parseOptionsLevelStr(level?: number | string): string {
		let defaultLevelStr = this.parent.parseLevel(0).levelStr;

		if (level == null) {
			return defaultLevelStr;
		}

		return this.parent.parseLevel(level).levelStr;
	}

	public parseOptionsName(name?: string): string {
		if (typeof name !== 'string') {
			return '';
		}

		return name;
	}

	// public handleMessage = (logMessage: LogMessage): void => {
	public handleMessage(logMessage: LogMessage): void {
		if (this instanceof LogListener !== true) {
			throw new Error('LogListener handleMessage failed - this context is not a LogListener');
		}

		if (logMessage == null) {
			return;
		}

		if (logMessage.levelNum < this.state.levelNum) {
			return;
		}

		this.state.logs.push(logMessage);
	}

	public enable(): void {
		this.events.on('LogEvent', this.handleMessage);
	}

	public disable(): void {
		this.events.off('LogEvent', this.handleMessage);
	}

	public showLogs(level?: number | string): void {
		let {levelNum, levelStr} = this.parent.parseLevel(level);

		let logList: string[] = [];

		logList.push(`${this.state.name}: ${this.state.levelStr}`);

		this.state.logs.forEach((log) => {
			if (log.levelNum > levelNum) {
				return;
			}

			let logStr = `${log.levelStr.toUpperCase()}: ${JSON.stringify(log.message)}`;

			logList.push(logStr);
		});

		this.state.action(logList.join('\n'));
	}
}
