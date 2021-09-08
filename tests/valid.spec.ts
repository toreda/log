import {validLevel} from '../src/valid/level';

const VALID_LEVELS = [1, 0, 1111, 3981, 888, 9999999];

const INVALID_LEVELS = [
	NaN,
	Number.NEGATIVE_INFINITY,
	Number.POSITIVE_INFINITY,
	Number.MAX_SAFE_INTEGER + 100,
	Number.MIN_SAFE_INTEGER - 100,
	-1,
	-10,
	1.5,
	-1.5,
	undefined,
	null,
	'non-empty string',
	'',
	[],
	['a', 'b', 'c']
];

describe('validLevel', () => {
	describe('Valid Levels', () => {
		for (const level of VALID_LEVELS) {
			it(`should return true for valid level '${level}'`, () => {
				expect(validLevel(level)).toBe(true);
			});
		}
	});

	describe('Invalid Levels', () => {
		for (const level of INVALID_LEVELS) {
			it(`should return false for invalid level '${level}'`, () => {
				expect(validLevel(level as any)).toBe(false);
			});
		}
	});
});
