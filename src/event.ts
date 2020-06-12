import { ArmorLogLevel } from './level';

export class ArmorLogEvent {
	public readonly level: ArmorLogLevel;

	constructor(level: ArmorLogLevel) {
		this.level = level;
	}
}