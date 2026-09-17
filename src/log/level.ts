import {Defaults} from '../defaults';
import type {LevelInput} from '../level/input';
import {checkLevel} from '../check/level';
import {levelMask} from '../level/mask';

/**
 * Bitmask of enabled log levels. Every method accepts a level bitmask
 * or a {@link LevelKey} string, and the bitmask is used internally.
 *
 * @category Log Level
 */
export class LogLevel {
	private currentLevel: number;

	/**
	 * @param initial	Level bitmask, level key, or array of either
	 * 					combined into the starting mask. Starts at
	 * 					`Levels.NONE` when invalid.
	 */
	constructor(initial?: LevelInput | LevelInput[] | null) {
		this.currentLevel = levelMask(initial) ?? 0x0;
	}

	/**
	 * Replace the current mask. An array is resolved item by item
	 * and combined with bitwise OR into the new mask.
	 * @param level		Level bitmask, level key, or array of either.
	 * @returns			false when level is invalid, leaving the mask unchanged.
	 */
	public set(level?: LevelInput | LevelInput[] | null): boolean {
		const mask = levelMask(level);

		if (mask === null) {
			return false;
		}

		this.currentLevel = mask;
		return true;
	}

	public get(): number {
		if (!checkLevel(this.currentLevel)) {
			return Defaults.GlobalLogLevel;
		}

		return this.currentLevel;
	}

	/**
	 * Add level flags to the current mask with bitwise OR. An array
	 * is resolved and applied one item at a time in order.
	 * @param level		Level bitmask, level key, or array of either.
	 * @returns			false when any level is invalid. Valid items
	 * 					of an array are still applied.
	 */
	public enableLevel(level: LevelInput | LevelInput[]): boolean {
		if (Array.isArray(level)) {
			return this.enableLevels(level);
		}

		const mask = levelMask(level);

		if (mask === null) {
			return false;
		}

		const result = this.currentLevel | mask;
		if (!checkLevel(result)) {
			return false;
		}

		this.currentLevel = result;
		return true;
	}

	public enableLevels(levels: LevelInput[]): boolean {
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

	/**
	 * Remove level flags from the current mask with bitwise AND NOT.
	 * An array is resolved and applied one item at a time in order.
	 * @param level		Level bitmask, level key, or array of either.
	 * @returns			false when any level is invalid. Valid items
	 * 					of an array are still applied.
	 */
	public disableLevel(level: LevelInput | LevelInput[]): boolean {
		if (Array.isArray(level)) {
			return this.disableLevels(level);
		}

		const mask = levelMask(level);

		if (mask === null) {
			return false;
		}

		const result = this.currentLevel & ~mask;
		if (!checkLevel(result)) {
			return false;
		}

		this.currentLevel = result;

		return true;
	}

	public disableLevels(levels: LevelInput[]): boolean {
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
