import {STRules, makeStrong} from '@toreda/strong-types';
import type {StrongInt} from '@toreda/strong-types';

export interface StrongLevel extends StrongInt {
	enableLogLevel: (level: number) => void;
	enableMultipleLevels: (levels: number[]) => void;
	disableLogLevel: (level: number) => void;
	disableMultipleLevels: (levels: number[]) => void;
}

export function makeLevel(fallback: number): StrongLevel {
	const rules = new STRules();
	rules.add().must.match.type.integer();
	rules.add().must.be.greaterThanOrEqualTo(0);

	const strong = makeStrong<number>(fallback, null, rules) as StrongLevel;

	return Object.assign(strong, {
		increment: () => null,
		decrement: () => null,
		enableLogLevel: (level: number) => {
			if (!isPositiveInteger(level)) {
				return;
			}

			strong(strong() | level);
		},
		enableMultipleLevels: (levels: number[]) => {
			if (!Array.isArray(levels)) {
				return;
			}

			for (const level of levels) {
				strong.enableLogLevel(level);
			}
		},
		disableLogLevel: (level: number) => {
			if (!isPositiveInteger(level)) {
				return;
			}

			strong(strong() ^ level);
		},
		disableMultipleLevels: (levels: number[]) => {
			if (!Array.isArray(levels)) {
				return;
			}

			for (const level of levels) {
				strong.disableLogLevel(level);
			}
		}
	});
}

export function isPositiveInteger(input: unknown): input is number {
	if (typeof input !== 'number') {
		return false;
	}

	if (isNaN(input)) {
		return false;
	}

	if (input < 1) {
		return false;
	}

	if (input % 1 != 0) {
		return false;
	}

	return true;
}
