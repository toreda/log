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

	if (!Number.isSafeInteger(level)) {
		return false;
	}

	return true;
}
