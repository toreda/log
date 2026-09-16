import {checkLevelKey} from '../../../src/check/level/key';

const VALID_KEYS = ['none', 'error', 'warn', 'info', 'debug', 'trace', 'all', 'all_custom', 'all_extended'];

const INVALID_KEYS: unknown[] = [
	'ERROR',
	'Error',
	' error',
	'error ',
	'fatal',
	'',
	'toString',
	'constructor',
	'hasOwnProperty',
	'__proto__',
	0,
	1,
	-1,
	NaN,
	null,
	undefined,
	true,
	[],
	['error'],
	{},
	Symbol('error')
];

describe('checkLevelKey', () => {
	describe('Valid Keys', () => {
		for (const key of VALID_KEYS) {
			it(`should return true for valid key '${key}'`, () => {
				expect(checkLevelKey(key)).toBe(true);
			});
		}
	});

	describe('Invalid Keys', () => {
		for (const key of INVALID_KEYS) {
			it(`should return false for invalid key '${String(key)}'`, () => {
				expect(checkLevelKey(key)).toBe(false);
			});
		}
	});
});
