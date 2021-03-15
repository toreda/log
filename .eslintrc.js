module.exports = {
	extends: ['@toreda/eslint-config'],
	overrides: [
		{
			files: ['*.spec.ts'],
			rules: {
				'max-len': 0
			}
		}
	]
};
