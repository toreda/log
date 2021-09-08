export function validNumber(input?: number | null): input is number {
	if (typeof input !== 'number') {
		return false;
	}

	if (isNaN(input)) {
		return false;
	}

	if (input < Number.MIN_SAFE_INTEGER || input > Number.MAX_SAFE_INTEGER) {
		return false;
	}

	return true;
}
