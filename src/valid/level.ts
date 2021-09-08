export function validLevel(level?: number | null): level is number {
	if (typeof level !== 'number') {
		return false;
	}

	if (isNaN(level)) {
		return false;
	}

	if (level < 0 || level > Number.MAX_SAFE_INTEGER) {
		return false;
	}

	// Quick integer test using Bitwise OR.
	if ((level | 0) !== level) {
		return false;
	}

	return true;
}
