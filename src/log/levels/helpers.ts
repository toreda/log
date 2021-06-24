import {StrongInt} from '@toreda/strong-types';

export function LogLevelEnable(obj: StrongInt, level: number): void {
	if (!isPositiveInteger(level)) {
		return;
	}

	obj(obj() | level);
}

export function LogLevelEnableMultiple(obj: StrongInt, levels: number[]): void {
	if (!Array.isArray(levels)) {
		return;
	}

	for (const level of levels) {
		LogLevelEnable(obj, level);
	}
}

export function LogLevelDisable(obj: StrongInt, level: number): void {
	if (!isPositiveInteger(level)) {
		return;
	}

	obj(obj() ^ level);
}

export function LogLevelDisableMultiple(obj: StrongInt, levels: number[]): void {
	if (!Array.isArray(levels)) {
		return;
	}

	for (const level of levels) {
		LogLevelDisable(obj, level);
	}
}

function isPositiveInteger(input: unknown): input is number {
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
