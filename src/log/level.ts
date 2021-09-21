import {Defaults} from '../defaults';
import {validLevel} from '../valid/level';

export class LogLevel {
	private currentLevel: number;

	constructor(initial?: number) {
		if (validLevel(initial)) {
			this.currentLevel = initial;
		} else {
			this.currentLevel = 0x0;
		}
	}

	public set(level?: number | null): boolean {
		if (!validLevel(level)) {
			return false;
		}

		this.currentLevel = level;
		return true;
	}

	public get(): number {
		if (!validLevel(this.currentLevel)) {
			return Defaults.GlobalLogLevel;
		}

		return this.currentLevel;
	}

	public enableLevel(level: number): boolean {
		if (!validLevel(level)) {
			return false;
		}

		const result = this.currentLevel | level;
		if (!validLevel(result)) {
			return false;
		}

		this.currentLevel = result;
		return true;
	}

	public enableLevels(levels: number[]): boolean {
		let success = true;

		if (!Array.isArray(levels)) {
			return false;
		}

		for (const level of levels) {
			const result = this.enableLevel(level);
			if (!result) {
				success = false;
			}
		}

		return success;
	}

	public disableLevel(level: number): boolean {
		if (!validLevel(level)) {
			return false;
		}

		const result = this.currentLevel & ~level;
		if (!validLevel(result)) {
			return false;
		}

		this.currentLevel = result;

		return true;
	}

	public disableLevels(levels: number[]): boolean {
		let success = true;

		if (!Array.isArray(levels)) {
			return false;
		}

		for (const level of levels) {
			const result = this.disableLevel(level);
			if (!result) {
				success = false;
			}
		}

		return success;
	}
}
