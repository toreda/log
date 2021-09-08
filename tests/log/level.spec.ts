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
});
