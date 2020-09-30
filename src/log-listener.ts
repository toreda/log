import {EventEmitter} from 'events';
import {LogEvent} from './log-event';
import {LogMessage} from './log-message';
import {Logger} from './logger';

export class LogListener {
	public events: EventEmitter;
	public levelNum: number;
	public levelStr: string;
	public name: string;
	public parent: Logger;
	public logs: LogMessage[] = [];

	constructor(events: EventEmitter, parent: Logger, level?: number | string, name?: string, action?: LogEvent) {
		if (!events) {
			throw new Error('LogListener init failed - no events argument provided.');
		}

		if (!(events instanceof EventEmitter)) {
			throw new Error('LogListener init failed - events argument not a valid EventEmitter instance.');
		}

		if (!parent) {
			throw new Error('LogListener init failed - no parent argument provided.');
		}

		if (!(parent instanceof Logger)) {
			throw new Error('LogListener init failed - parent argument not a valid Logger instance.');
		}

		this.events = events;
		this.parent = parent;

		let parseLevel: number | string;

		if (level == null) {
			parseLevel = 0;
		} else {
			parseLevel = level;
		}

		({levelNum: this.levelNum, levelStr: this.levelStr} = this.parent.parseLevel(parseLevel));

		if (name == null) {
			this.name = '';
		} else {
			this.name = name;
		}

		if (action != null) {
			this.action = action;
		}

		this.action = this.action.bind(this);

		this.enable();
	}

	public action(logMessage: LogMessage): void {
		if (logMessage.levelNum < this.levelNum) {
			return;
		}

		this.logs.push(logMessage);
	}

	public enable(): void {
		this.events.on('LogEvent', this.action);
	}

	public disable(): void {
		this.events.off('LogEvent', this.action);
	}

	public showLogs(level?: number | string): void {
		let {levelNum, levelStr} = this.parent.parseLevel(level);

		let logList: string[] = [];

		logList.push(`${this.name}: ${this.levelStr}`);

		this.logs.forEach((log) => {
			if (log.levelNum > levelNum) {
				return;
			}

			let logStr: string;

			if (typeof log.message === 'string') {
				logStr = log.message;
			} else {
				logStr = JSON.stringify(log.message);
			}

			logList.push(logStr);
		});

		console.log(logList.join('\n'));
	}
}
