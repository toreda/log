import {ArmorLogDispatcher} from './dispatcher';
import {ArmorLogLevel} from './level';
import {ArmorLogOptions} from './options';
import {EventEmitter} from 'events';

export class ArmorLog {
	public readonly events: EventEmitter;
	public readonly options: ArmorLogOptions;
	public readonly dispatcher: ArmorLogDispatcher;

	constructor(events?: EventEmitter, options?: ArmorLogOptions) {
		this.events = this.createEvents(events);
		this.options = this.createOptions(options);
		this.dispatcher = new ArmorLogDispatcher(this.events);
	}

	public createOptions(options?: ArmorLogOptions): ArmorLogOptions {
		if (!options) {
			return new ArmorLogOptions();
		}

		if (!(options instanceof ArmorLogOptions)) {
			return new ArmorLogOptions();
		}

		return options;
	}

	public createEvents(events?: EventEmitter): EventEmitter {
		if (!events) {
			return new EventEmitter();
		}

		if (!(events instanceof EventEmitter)) {
			return new EventEmitter();
		}

		return events;
	}

	public log(level: any, ...args: any[]): ArmorLog {
		return this;
	}

	public warn(...args: any[]): ArmorLog {
		return this;
	}

	public debug(...args: any[]): ArmorLog {
		return this;
	}

	public trace(...args: any[]): ArmorLog {
		return this;
	}

	public info(...args: any[]): ArmorLog {
		return this;
	}

	public error(...args: any[]): ArmorLog {
		return this;
	}

	public custom(level: any, ...args: any[]): ArmorLog {
		return this;
	}
}
