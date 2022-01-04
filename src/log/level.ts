import {Defaults} from '../defaults';
import {checkLevel} from '../check/level';

/**
 * @category Log Level
 */
export class LogLevel {
	private currentLevel: number;

	constructor(initial?: number) {
		if (checkLevel(initial)) {
			this.currentLevel = initial;
		} else {
			this.currentLevel = 0x0;
		}
	}

	public set(level?: number | null): boolean {
		if (!checkLevel(level)) {
			return false;
		}

		this.currentLevel = level;
		return true;
	}

	public get(): number {
		if (!checkLevel(this.currentLevel)) {
			return Defaults.GlobalLogLevel;
		}

		return this.currentLevel;
	}

	public enableLevel(level: number): boolean {
		if (!checkLevel(level)) {
			return false;
		}

		const result = this.currentLevel | level;
		if (!checkLevel(result)) {
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
		if (!checkLevel(level)) {
			return false;
		}

		const result = this.currentLevel & ~level;
		if (!checkLevel(result)) {
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
