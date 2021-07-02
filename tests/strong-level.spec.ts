import {isPositiveInteger, makeLevel} from '../src/strong-level';

describe(`StrongLevel`, () => {
	const levelObj = makeLevel(0);
	const invalidLevels: any[] = [0, -1, 0.345, 1.456, '0', '1', 'f', NaN, null, undefined, ''];

	describe(`enableLogLevel`, () => {
		it(`should add 'level' to the 'obj'`, () => {
			levelObj(0b001);
			const level = 0b100;
			const expected = 0b101;

			levelObj.enableLogLevel(level);

			expect(levelObj()).toBe(expected);
		});

		it.each(invalidLevels)(`should not change the 'obj' when 'level' is %p`, (level) => {
			const expected = levelObj(0);

			levelObj.enableLogLevel(level);

			expect(levelObj()).toBe(expected);
		});
	});

	describe(`enableMultipleLevels`, () => {
		it(`should not change the 'obj' when 'level' is not an array`, () => {
			const expected = levelObj(0);

			levelObj.enableMultipleLevels(16 as any);

			expect(levelObj()).toBe(expected);
		});

		it.each(invalidLevels)(`should not change the 'obj' when 'level' is %p`, (level) => {
			const expected = levelObj(0);

			levelObj.enableMultipleLevels([level]);

			expect(levelObj()).toBe(expected);
		});
	});

	describe(`disableLogLevel`, () => {
		it(`should remove 'level' from the 'obj'`, () => {
			levelObj(0b101);
			const level = 0b100;
			const expected = 0b001;

			levelObj.disableLogLevel(level);

			expect(levelObj()).toBe(expected);
		});

		it.each(invalidLevels)(`should not change the 'obj' when 'level' is %p`, (level) => {
			const expected = levelObj(15);

			levelObj.disableLogLevel(level);

			expect(levelObj()).toBe(expected);
		});
	});

	describe(`disableMultipleLevels`, () => {
		it(`should not change the 'obj' when 'level' is not an array`, () => {
			const expected = levelObj(15);

			levelObj.disableMultipleLevels(2 as any);

			expect(levelObj()).toBe(expected);
		});

		it.each(invalidLevels)(`should not change the 'obj' when 'level' is %p`, (level) => {
			const expected = levelObj(15);

			levelObj.disableMultipleLevels([level]);

			expect(levelObj()).toBe(expected);
		});
	});

	describe(`isPositiveInteger`, () => {
		it(`should return true when 'input' is a positve integer`, () => {
			const result = isPositiveInteger(3);

			expect(result).toBeTruthy();
		});

		it.each(invalidLevels)(`should return false when 'input' is %p`, (level) => {
			const result = isPositiveInteger(level);

			expect(result).toBeFalsy();
		});
	});

	describe(`increment`, () => {
		it(`should return null`, () => {
			const result = levelObj.increment();

			expect(result).toBeNull();
		});
	});

	describe(`decrement`, () => {
		it(`should return null`, () => {
			const result = levelObj.decrement();

			expect(result).toBeNull();
		});
	});
});
