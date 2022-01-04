export function checkId(input?: string | null): input is string {
	if (typeof input !== 'string') {
		return false;
	}

	const trimmed = input.trim();
	if (!trimmed) {
		return false;
	}

	return true;
}
