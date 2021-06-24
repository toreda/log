import {makeInt} from '@toreda/strong-types';
import {
	LogLevelDisable,
	LogLevelDisableMultiple,
	LogLevelEnable,
	LogLevelEnableMultiple
} from '../../../src/log/levels/helpers';

const levelObj = makeInt(0);
const invalidLevels: any[] = [-1, 0, 0.345, 1.456, '0', '1', 'f', NaN, null, undefined, ''];

describe(`LogLevelEnable`, () => {
	it.each(invalidLevels)(`should not change the 'obj' when 'level' is %p`, (level) => {
		const expected = levelObj(0);

		LogLevelEnable(levelObj, level);

		expect(levelObj()).toBe(expected);
	});

	it(`should add 'level' to the 'obj'`, () => {
		levelObj(0b001);
		const level = 0b100;
		const expected = 0b101;

		LogLevelEnable(levelObj, level);

		expect(levelObj()).toBe(expected);
	});
});

describe(`LogLevelEnableMultiple`, () => {
	it(`should not change the 'obj' when 'level' is not an array`, () => {
		const expected = levelObj(0);

		LogLevelEnableMultiple(levelObj, 16 as any);

		expect(levelObj()).toBe(expected);
	});

	it.each(invalidLevels)(`should not change the 'obj' when 'level' is %p`, (level) => {
		const expected = levelObj(0);

		LogLevelEnableMultiple(levelObj, [level]);

		expect(levelObj()).toBe(expected);
	});
});

describe(`LogLevelDisable`, () => {
	it.each(invalidLevels)(`should not change the 'obj' when 'level' is %p`, (level) => {
		const expected = levelObj(15);

		LogLevelDisable(levelObj, level);

		expect(levelObj()).toBe(expected);
	});

	it(`should remove 'level' from the 'obj'`, () => {
		levelObj(0b101);
		const level = 0b100;
		const expected = 0b001;

		LogLevelDisable(levelObj, level);

		expect(levelObj()).toBe(expected);
	});
});

describe(`LogLevelDisableMultiple`, () => {
	it(`should not change the 'obj' when 'level' is not an array`, () => {
		const expected = levelObj(15);

		LogLevelDisableMultiple(levelObj, 2 as any);

		expect(levelObj()).toBe(expected);
	});

	it.each(invalidLevels)(`should not change the 'obj' when 'level' is %p`, (level) => {
		const expected = levelObj(15);

		LogLevelDisableMultiple(levelObj, [level]);

		expect(levelObj()).toBe(expected);
	});
});
