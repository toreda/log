const toreda = require('@toreda/eslint-config');

module.exports = [
	{
		ignores: ['dist/**', 'coverage/**', 'docs/**', 'node_modules/**']
	},
	...toreda
];
