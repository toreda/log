import {ActionResult} from '@toreda/action-result';
import {LogLevels} from './log/levels';
import {LogMessage} from './log/message';
import {LogOptions} from './log/options';
import {LogState} from './log/state';
import {LogTransport} from './log/transport';

type ActResLogTrnPrt = ActionResult<LogTransport>;

export class Log {
	public readonly state: LogState;

	public constructor(options?: LogOptions) {
		this.state = new LogState(options);
	}

	public attachTransport(transport: LogTransport, levels?: LogLevels | LogLevels[]): ActResLogTrnPrt {
		const result = new ActionResult<LogTransport>({payload: transport});

		if (!transport || !(transport instanceof LogTransport)) {
			result.error(new Error('transport is not a LogTransport'));
			return result;
		}

		let logLevels: LogLevels[];

		if (levels == null) {
			logLevels = [LogLevels.ERROR, LogLevels.WARN, LogLevels.INFO, LogLevels.DEBUG, LogLevels.TRACE];
		} else if (Array.isArray(levels)) {
			logLevels = levels;
		} else {
			logLevels = [];
			for (let lvl = 1; lvl <= levels; lvl *= 2) {
				logLevels.push(lvl);
			}
		}

		this.state.transportNames[transport.state.id()] = transport;
		logLevels.forEach((lvl) => {
			if (!this.state.transportGroups[lvl]) {
				this.state.transportGroups[lvl] = [];
			}
			this.state.transportGroups[lvl].push(transport.state.id());
		});

		return result;
	}

	public getTransportFromId(id: string): LogTransport | null {
		if (typeof id !== 'string') {
			return null;
		}

		const transport = this.state.transportNames[id];
		if (!transport) {
			return null;
		}

		return transport;
	}

	public removeTransport(transport: LogTransport): ActionResult<LogTransport> {
		const result = new ActionResult<LogTransport>({payload: transport});

		if (!transport || !(transport instanceof LogTransport)) {
			result.error(new Error('transport is not a LogTransport'));
			return result;
		}

		const target = this.state.transportNames[transport.state.id()];
		if (target === transport) {
			for (const level in this.state.transportGroups) {
				const index = this.state.transportGroups[level].indexOf(transport.state.id());
				if (index >= 0) {
					this.state.transportGroups[level].splice(index, 1);
				}
			}

			delete this.state.transportNames[transport.state.id()];
		}

		return result;
	}

	public log(level: LogLevels, ...args: unknown[]): Log {
		let message: unknown;

		if (args.length === 0) {
			message = '';
		} else if (args.length === 1) {
			message = args[0];
		} else {
			message = args;
		}

		const logMessage: LogMessage = {
			date: new Date().toISOString(),
			level: LogLevels[level],
			message: message
		};

		for (let bitMask = 1; bitMask <= 16; bitMask *= 2) {
			const currentLevel = level & bitMask;
			if (currentLevel === 0) {
				continue;
			}

			if (!this.state.transportGroups[currentLevel]) {
				continue;
			}

			for (const transportId of this.state.transportGroups[currentLevel]) {
				this.state.transportNames[transportId].execute(logMessage);
			}
		}

		return this;
	}

	public error(...args: unknown[]): Log {
		this.log(LogLevels.ERROR, ...args);

		return this;
	}

	public warn(...args: unknown[]): Log {
		this.log(LogLevels.WARN, ...args);

		return this;
	}

	public info(...args: unknown[]): Log {
		this.log(LogLevels.INFO, ...args);

		return this;
	}

	public debug(...args: unknown[]): Log {
		this.log(LogLevels.DEBUG, ...args);

		return this;
	}

	public trace(...args: unknown[]): Log {
		this.log(LogLevels.TRACE, ...args);

		return this;
	}
}
