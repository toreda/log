import type {LevelKey} from '../../src/level/key';
import {Levels} from '../../src/levels';
import {levelMask} from '../../src/level/mask';

const KEY_PAIRS: Array<[LevelKey, Levels]> = [
	['none', Levels.NONE],
	['error', Levels.ERROR],
	['warn', Levels.WARN],
	['info', Levels.INFO],
	['debug', Levels.DEBUG],
	['trace', Levels.TRACE],
	['all', Levels.ALL],
	['all_custom', Levels.ALL_CUSTOM],
	['all_extended', Levels.ALL_EXTENDED]
];

const VALID_NUMBERS = [0, 1, 0b1010, 111, 0b0010_0000_0000, Number.MAX_SAFE_INTEGER];

const INVALID_INPUTS: unknown[] = [
	undefined,
	null,
	NaN,
	-1,
	1.5,
	Number.POSITIVE_INFINITY,
	Number.MAX_SAFE_INTEGER + 100,
	'',
	'ERROR',
	'fatal',
	'1',
	'toString',
	true,
	{}
];

describe('levelMask', () => {
	describe('level keys', () => {
		it.each(KEY_PAIRS)(`should resolve '%s' to %p`, (key, expected) => {
			expect(levelMask(key)).toBe(expected);
		});
	});

	describe('bitmask numbers', () => {
		it.each(VALID_NUMBERS)(`should return valid bitmask %p unchanged`, (level) => {
			expect(levelMask(level)).toBe(level);
		});
	});

	describe('invalid inputs', () => {
		it.each(INVALID_INPUTS)(`should return null for %p`, (input) => {
			expect(levelMask(input as any)).toBeNull();
		});
	});

	describe('arrays', () => {
		it('should resolve a single-item array to that item', () => {
			expect(levelMask(['debug'])).toBe(Levels.DEBUG);
			expect(levelMask([Levels.DEBUG])).toBe(Levels.DEBUG);
		});

		it('should combine level keys with bitwise OR', () => {
			expect(levelMask(['error', 'warn', 'trace'])).toBe(Levels.ERROR | Levels.WARN | Levels.TRACE);
		});

		it('should combine bitmasks with bitwise OR', () => {
			expect(levelMask([Levels.ERROR, Levels.INFO])).toBe(Levels.ERROR | Levels.INFO);
		});

		it('should combine mixed keys and bitmasks', () => {
			expect(levelMask(['error', Levels.DEBUG, 'trace'])).toBe(
				Levels.ERROR | Levels.DEBUG | Levels.TRACE
			);
		});

		it('should not double count repeated keys', () => {
			expect(levelMask(['error', 'error'])).toBe(Levels.ERROR);
		});

		it(`should resolve 'none' in an array as no flags`, () => {
			expect(levelMask(['none', 'warn'])).toBe(Levels.WARN);
		});

		it('should return null for an empty array', () => {
			expect(levelMask([])).toBeNull();
		});

		it('should return null when any item is an invalid key', () => {
			expect(levelMask(['error', 'fatal' as any, 'warn'])).toBeNull();
		});

		it('should return null when any item is an invalid number', () => {
			expect(levelMask(['error', -1])).toBeNull();
			expect(levelMask([Levels.ERROR, NaN])).toBeNull();
		});
	});
});
