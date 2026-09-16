import {Levels} from '../../src/levels';
import {LogLevel} from '../../src/log/level';

describe(`LogLevel`, () => {
	let instance: LogLevel;

	beforeAll(() => {
		instance = new LogLevel(0);
	});

	const invalidLevels: any[] = [0, -1, 0.345, 1.456, '0', '1', 'f', NaN, null, undefined, ''];

	describe(`enableLevel`, () => {
		it(`should add 'level' to the 'obj'`, () => {
			instance.set(0b001);
			const level = 0b100;
			const expected = 0b101;

			instance.enableLevel(level);

			expect(instance.get()).toBe(expected);
		});

		it(`should add 'level' to the 'obj' when there is overlap`, () => {
			instance.set(0b10101);
			const level = 0b00110;
			const expected = 0b10111;

			instance.enableLevel(level);

			expect(instance.get()).toBe(expected);
		});

		it.each(invalidLevels)(`should not change the 'obj' when 'level' is %p`, (level) => {
			const expected = 0;
			instance.set(0);

			instance.enableLevel(level);

			expect(instance.get()).toBe(expected);
		});
	});

	describe(`enableLevels`, () => {
		it(`should not change the 'obj' when 'level' is not an array`, () => {
			const expected = 0;
			instance.set(0);

			instance.enableLevels(16 as any);

			expect(instance.get()).toBe(expected);
		});

		it.each(invalidLevels)(`should not change the 'obj' when 'level' is %p`, (level) => {
			const expected = 0;
			instance.set(0);

			instance.enableLevels([level]);

			expect(instance.get()).toBe(expected);
		});
	});

	describe(`disableLevel`, () => {
		it(`should remove 'level' from the 'obj'`, () => {
			instance.set(0b101);
			const level = 0b100;
			const expected = 0b001;

			instance.disableLevel(level);

			expect(instance.get()).toBe(expected);
		});

		it(`should remove 'level' from the 'obj' when a bit does not overlap`, () => {
			instance.set(0b10101);
			const level = 0b00110;
			const expected = 0b10001;

			instance.disableLevel(level);

			expect(instance.get()).toBe(expected);
		});

		it.each(invalidLevels)(`should not change the 'obj' when 'level' is %p`, (level) => {
			const expected = 15;
			instance.set(expected);
			instance.disableLevel(level);

			expect(instance.get()).toBe(expected);
		});
	});

	describe(`disableLevels`, () => {
		it(`should not change the 'obj' when 'level' is not an array`, () => {
			const expected = 15;
			instance.set(expected);

			instance.disableLevels(2 as any);

			expect(instance.get()).toBe(expected);
		});

		it.each(invalidLevels)(`should not change the 'obj' when 'level' is %p`, (level) => {
			const expected = 15;
			instance.set(expected);

			instance.disableLevels([level]);

			expect(instance.get()).toBe(expected);
		});
	});

	describe(`constructor`, () => {
		it(`should start at 0 when initial is not provided`, () => {
			expect(new LogLevel().get()).toBe(0);
		});

		it(`should start at 0 when initial is an unknown key`, () => {
			expect(new LogLevel('fatal' as any).get()).toBe(0);
		});

		it(`should accept a level key`, () => {
			expect(new LogLevel('debug').get()).toBe(Levels.DEBUG);
		});

		it(`should combine an array of keys and bitmasks`, () => {
			expect(new LogLevel(['error', Levels.TRACE]).get()).toBe(Levels.ERROR | Levels.TRACE);
		});
	});

	describe(`set`, () => {
		beforeEach(() => {
			instance.set(Levels.INFO);
		});

		it(`should set the mask from a level key`, () => {
			expect(instance.set('trace')).toBe(true);
			expect(instance.get()).toBe(Levels.TRACE);
		});

		it(`should combine an array of level keys with bitwise OR`, () => {
			expect(instance.set(['error', 'warn'])).toBe(true);
			expect(instance.get()).toBe(Levels.ERROR | Levels.WARN);
		});

		it(`should combine mixed keys and bitmasks`, () => {
			expect(instance.set(['error', Levels.DEBUG])).toBe(true);
			expect(instance.get()).toBe(Levels.ERROR | Levels.DEBUG);
		});

		it(`should not change the mask when key is unknown`, () => {
			expect(instance.set('fatal' as any)).toBe(false);
			expect(instance.get()).toBe(Levels.INFO);
		});

		it(`should not change the mask when array is empty`, () => {
			expect(instance.set([])).toBe(false);
			expect(instance.get()).toBe(Levels.INFO);
		});

		it(`should not change the mask when any array item is invalid`, () => {
			expect(instance.set(['error', 'fatal' as any])).toBe(false);
			expect(instance.get()).toBe(Levels.INFO);
		});
	});

	describe(`enableLevel with level keys`, () => {
		beforeEach(() => {
			instance.set(Levels.ERROR);
		});

		it(`should add the level key's bitmask to the mask`, () => {
			expect(instance.enableLevel('debug')).toBe(true);
			expect(instance.get()).toBe(Levels.ERROR | Levels.DEBUG);
		});

		it(`should apply each item of an array one at a time in order`, () => {
			const spy = jest.spyOn(instance, 'enableLevel');
			const levels = ['warn', Levels.INFO, 'trace'] as const;

			expect(instance.enableLevel([...levels])).toBe(true);

			expect(spy.mock.calls.slice(1)).toEqual([['warn'], [Levels.INFO], ['trace']]);
			expect(instance.get()).toBe(Levels.ERROR | Levels.WARN | Levels.INFO | Levels.TRACE);
			spy.mockRestore();
		});

		it(`should still apply valid items when an array item is invalid`, () => {
			expect(instance.enableLevel(['warn', 'fatal' as any, 'trace'])).toBe(false);
			expect(instance.get()).toBe(Levels.ERROR | Levels.WARN | Levels.TRACE);
		});

		it(`should not change the mask when key is unknown`, () => {
			expect(instance.enableLevel('fatal' as any)).toBe(false);
			expect(instance.get()).toBe(Levels.ERROR);
		});

		it(`should accept level keys in enableLevels`, () => {
			expect(instance.enableLevels(['info', 'debug'])).toBe(true);
			expect(instance.get()).toBe(Levels.ERROR | Levels.INFO | Levels.DEBUG);
		});
	});

	describe(`disableLevel with level keys`, () => {
		beforeEach(() => {
			instance.set(Levels.ALL);
		});

		it(`should remove the level key's bitmask from the mask`, () => {
			expect(instance.disableLevel('debug')).toBe(true);
			expect(instance.get()).toBe(Levels.ALL & ~Levels.DEBUG);
		});

		it(`should apply each item of an array one at a time in order`, () => {
			const spy = jest.spyOn(instance, 'disableLevel');

			expect(instance.disableLevel(['debug', Levels.TRACE])).toBe(true);

			expect(spy.mock.calls.slice(1)).toEqual([['debug'], [Levels.TRACE]]);
			expect(instance.get()).toBe(Levels.ALL & ~Levels.DEBUG & ~Levels.TRACE);
			spy.mockRestore();
		});

		it(`should still apply valid items when an array item is invalid`, () => {
			expect(instance.disableLevel(['debug', 'fatal' as any, 'trace'])).toBe(false);
			expect(instance.get()).toBe(Levels.ALL & ~Levels.DEBUG & ~Levels.TRACE);
		});

		it(`should not change the mask when key is unknown`, () => {
			expect(instance.disableLevel('fatal' as any)).toBe(false);
			expect(instance.get()).toBe(Levels.ALL);
		});

		it(`should accept level keys in disableLevels`, () => {
			expect(instance.disableLevels(['info', 'debug'])).toBe(true);
			expect(instance.get()).toBe(Levels.ALL & ~Levels.INFO & ~Levels.DEBUG);
		});
	});
});
