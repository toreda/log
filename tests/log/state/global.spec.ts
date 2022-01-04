import {Levels} from '../../../src/levels';
import {LogStateGlobal} from '../../../src/log/state/global';

describe('LogStateGlobal', () => {
	describe('Constructor', () => {
		describe(`groupsStartEnabled`, () => {
			const defaultValue = true;

			it(`should set groupsStartEnabled to defaultValue when option.groupsStartEnabled is not provided`, () => {
				const custom = new LogStateGlobal({
					id: 'custom'
				});

				expect(custom.groupsStartEnabled).toBe(defaultValue);
			});

			it(`should set groupsStartEnabled to true when option.groupsStartEnabled is true`, () => {
				const expected = true;

				const custom = new LogStateGlobal({
					id: 'custom',
					groupsStartEnabled: true
				});

				expect(custom.groupsStartEnabled).toBe(expected);
			});

			it(`should set groupsStartEnabled to false when option.groupsStartEnabled is false`, () => {
				const expected = false;

				const custom = new LogStateGlobal({
					id: 'custom',
					groupsStartEnabled: false
				});

				expect(custom.groupsStartEnabled).toBe(expected);
			});

			it(`should set groupsStartEnabled to defaultValue when option.groupsStartEnabled is non-boolean truthy `, () => {
				const custom = new LogStateGlobal({
					id: 'custom',
					groupsStartEnabled: 14971 as any
				});

				expect(custom.groupsStartEnabled).toBe(defaultValue);
			});
		});

		describe(`globalLevel`, () => {
			const defaultValue = Levels.ALL & ~Levels.DEBUG & ~Levels.TRACE;

			it(`should set globalLevel to defaultValue when option.globalLevel is not provided`, () => {
				const custom = new LogStateGlobal({
					id: 'custom'
				});

				expect(custom.globalLevel.get()).toBe(defaultValue);
			});

			it(`should set globalLevel to '111' when option.globalLevel is '111'`, () => {
				const expected = 111;

				const custom = new LogStateGlobal({
					id: 'custom',
					globalLevel: expected
				});

				expect(custom.globalLevel.get()).toBe(expected);
			});

			it(`should set globalLevel to defaultValue when option.globalLevel is NaN `, () => {
				const custom = new LogStateGlobal({
					id: 'custom',
					globalLevel: NaN
				});

				expect(custom.globalLevel.get()).toBe(defaultValue);
			});

			it(`should set globalLevel to defaultValue when option.globalLevel is a string `, () => {
				const custom = new LogStateGlobal({
					id: 'custom',
					globalLevel: '14971' as any
				});

				expect(custom.globalLevel.get()).toBe(defaultValue);
			});

			it(`should set globalLevel to defaultValue when option.globalLevel is a negative number `, () => {
				const custom = new LogStateGlobal({
					id: 'custom',
					globalLevel: -145
				});

				expect(custom.globalLevel.get()).toBe(defaultValue);
			});
		});

		describe(`consoleEnabled`, () => {
			const defaultValue = false;

			it(`should set consoleEnabled to defaultValue when option.consoleEnabled is not provided`, () => {
				const custom = new LogStateGlobal({
					id: 'custom'
				});

				expect(custom.consoleEnabled).toBe(defaultValue);
			});

			it(`should set consoleEnabled to true when option.consoleEnabled is true`, () => {
				const expected = true;

				const custom = new LogStateGlobal({
					id: 'custom',
					consoleEnabled: true
				});

				expect(custom.consoleEnabled).toBe(expected);
			});

			it(`should set consoleEnabled to false when option.consoleEnabled is false`, () => {
				const expected = false;

				const custom = new LogStateGlobal({
					id: 'custom',
					consoleEnabled: false
				});

				expect(custom.consoleEnabled).toBe(expected);
			});

			it(`should set consoleEnabled to defaultValue when option.consoleEnabled is non-boolean truthy `, () => {
				const custom = new LogStateGlobal({
					id: 'custom',
					consoleEnabled: 14971 as any
				});

				expect(custom.consoleEnabled).toBe(defaultValue);
			});
		});

		describe(`groups`, () => {
			it(`should create a map`, () => {
				const custom = new LogStateGlobal({
					id: 'custom'
				});

				expect(custom.groups).toBeInstanceOf(Map);
			});
		});
	});
});
