import type {LevelKey} from '../../src/level/key';
import {LevelKeys} from '../../src/level/keys';
import {Levels} from '../../src/levels';

const PAIRS: Array<[LevelKey, Levels]> = [
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

describe('LevelKeys', () => {
	it.each(PAIRS)(`should map '%s' to bitmask %p`, (key, level) => {
		expect(LevelKeys[key]).toBe(level);
	});

	it('should contain exactly one key per built-in level', () => {
		const expected = PAIRS.map(([key]) => key).sort();

		expect(Object.keys(LevelKeys).sort()).toEqual(expected);
	});

	it('should be frozen', () => {
		expect(Object.isFrozen(LevelKeys)).toBe(true);
	});
});
