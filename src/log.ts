import {ArmorActionResult} from '@armorjs/action-result';
import {LogLevels} from './log/levels';
import {LogMessage} from './log/message';
import {LogOptions} from './log/options';
import {LogState} from './log/state';
import {LogTransport} from './log/transport';

export class Log {
	public readonly state: LogState;

	public constructor(options?: LogOptions) {
		this.state = new LogState(options);
	}

	public attachTransport(transport: LogTransport, levels?: LogLevels | LogLevels[]): ArmorActionResult {
		const result = new ArmorActionResult();
		result.state.failOnError.enabled = true;
		result.payload = transport;

		if (!transport || !(transport instanceof LogTransport)) {
			result.error(new Error('transport is not a LogTransport'));
			return result.complete();
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

		result.payload = transport.state.id();
		return result.complete();
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

	public removeTransport(transport: LogTransport): ArmorActionResult {
		const result = new ArmorActionResult();
		result.state.failOnError.enabled = true;
		result.payload = transport;

		if (!transport || !(transport instanceof LogTransport)) {
			result.error(new Error('transport is not a LogTransport'));
			return result.complete();
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

		return result.complete();
	}

	public log(level: LogLevels, ...args: any[]): Log {
		let message: any;

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

	public error(...args: any[]): Log {
		this.log.apply(this, [LogLevels.ERROR as any].concat(args));

		return this;
	}

	public warn(...args: any[]): Log {
		this.log.apply(this, [LogLevels.WARN as any].concat(args));

		return this;
	}

	public info(...args: any[]): Log {
		this.log.apply(this, [LogLevels.INFO as any].concat(args));

		return this;
	}

	public debug(...args: any[]): Log {
		this.log.apply(this, [LogLevels.DEBUG as any].concat(args));

		return this;
	}

	public trace(...args: any[]): Log {
		this.log.apply(this, [LogLevels.TRACE as any].concat(args));

		return this;
	}
}
