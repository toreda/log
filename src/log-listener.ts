// import {EventEmitter} from 'events';
// import {LogEvent} from './log-event';
// import {LogListenerOptions} from './log-listener-options';
// import {LogListenerState} from './log-listener-state';
// import {LogMessage} from './log-message';
// import {Logger} from './logger';

// export class LogListener {
// 	public events: EventEmitter;
// 	public parent: Logger;
// 	public readonly state: LogListenerState;

// 	constructor(parent: Logger, events: EventEmitter, options?: LogListenerOptions) {
// 		if (!parent) {
// 			throw new Error('LogListener init failed - no parent argument provided.');
// 		}

// 		if (!(parent instanceof Logger)) {
// 			throw new Error('LogListener init failed - parent argument not a valid Logger instance.');
// 		}

// 		if (!events) {
// 			throw new Error('LogListener init failed - no events argument provided.');
// 		}

// 		if (!(events instanceof EventEmitter)) {
// 			throw new Error('LogListener init failed - events argument not a valid EventEmitter instance.');
// 		}

// 		this.events = events;
// 		this.parent = parent;

// 		this.state = this.parseOptions(options);

// 		this.handleMessage = this.handleMessage.bind(this);
// 		this.enable();
// 	}

// 	public parseOptions(options: LogListenerOptions = {}): LogListenerState {
// 		return {
// 			action: this.parseOptionsAction(options.action),
// 			eventId: 'LogEvent' + this.parent.state.id,
// 			levelNum: this.parseOptionsLevelNum(options.level),
// 			levelStr: this.parseOptionsLevelStr(options.level),
// 			logs: [],
// 			name: this.parseOptionsName(options.name),
// 			silent: this.parseOptionsSilent(options.silent)
// 		};
// 	}

// 	public parseOptionsAction(action?: LogEvent): LogEvent {
// 		if (typeof action !== 'function') {
// 			return (message) => {
// 				console.log(message);
// 			};
// 		}

// 		return action;
// 	}

// 	public parseOptionsLevelNum(level?: number | string): number {
// 		let defaultLevelNum = this.parent.parseLevel(0).levelNum;

// 		if (level == null) {
// 			return defaultLevelNum;
// 		}

// 		return this.parent.parseLevel(level).levelNum;
// 	}

// 	public parseOptionsLevelStr(level?: number | string): string {
// 		let defaultLevelStr = this.parent.parseLevel(0).levelStr;

// 		if (level == null) {
// 			return defaultLevelStr;
// 		}

// 		return this.parent.parseLevel(level).levelStr;
// 	}

// 	public parseOptionsName(name?: string): string {
// 		if (typeof name !== 'string') {
// 			return '';
// 		}

// 		return name;
// 	}

// 	public parseOptionsSilent(silent?: boolean): boolean {
// 		if (typeof silent !== 'boolean') {
// 			return false;
// 		}

// 		return silent;
// 	}

// 	public createDateString(date: Date): string {
// 		return date
// 			.toISOString()
// 			.split(/T|\.|Z/)
// 			.slice(0, 3)
// 			.join(' ');
// 	}

// 	public handleMessage(logMessage: LogMessage): void {
// 		if (this instanceof LogListener !== true) {
// 			throw new Error('LogListener handleMessage failed - this context is not a LogListener');
// 		}

// 		if (logMessage.level < this.state.levelNum) {
// 			return;
// 		}

// 		this.state.logs.push(logMessage);

// 		if (this.state.silent === false) {
// 			this.state.action(this.parseLogMessage(logMessage));
// 		}
// 	}

// 	public parseLogMessage(logMessage: LogMessage): string {
// 		let result: string;

// 		let datestring = this.createDateString(new Date(logMessage.date));

// 		let level = logMessage.levelStr.toUpperCase();

// 		let message: string;
// 		if (logMessage.message.length == 1) {
// 			message = JSON.stringify(logMessage.message[0]);
// 		} else {
// 			message = JSON.stringify(logMessage.message);
// 		}

// 		result = `[${datestring}] ${level}: ${message}`;

// 		return result;
// 	}

// 	public enable(): void {
// 		this.events.on(this.state.eventId, this.handleMessage);
// 	}

// 	public disable(): void {
// 		this.events.off(this.state.eventId, this.handleMessage);
// 	}

// 	public showLogs(level?: number | string, action?: LogEvent): void {
// 		let {levelNum, levelStr} = this.parent.parseLevel(level);

// 		let logList: string[] = [];

// 		logList.push(`[${this.createDateString(new Date())}] ${this.state.name}: ${this.state.levelStr}`);

// 		this.state.logs.forEach((log) => {
// 			if (log.levelNum > levelNum) {
// 				return;
// 			}

// 			let logStr = ` ${this.parseLogMessage(log)}`;

// 			logList.push(logStr);
// 		});

// 		let fullMessage = logList.join('\n');

// 		if (typeof action === 'function') {
// 			action(fullMessage);
// 		} else {
// 			this.state.action(fullMessage);
// 		}
// 	}
// }
