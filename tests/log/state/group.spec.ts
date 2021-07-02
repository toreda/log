import {Levels} from '../../../src/levels';
import {LogStateGroup} from '../../../src/log/state/group';

describe('LogStateGroup', () => {
	describe('Constructor', () => {
		describe(`id`, () => {
			const defaultValue = '';

			it(`should set id to defaultValue when option.id is not provided`, () => {
				const custom = new LogStateGroup({
					id: undefined as any
				});

				expect(custom.id()).toBe(defaultValue);
			});

			it(`should set id to 'custom' when option.id is 'custom'`, () => {
				const expected = 'custom';

				const custom = new LogStateGroup({
					id: expected
				});

				expect(custom.id()).toBe(expected);
			});

			it(`should set id to defaultValue when option.id is not a string`, () => {
				const custom = new LogStateGroup({
					id: 123 as any
				});

				expect(custom.id()).toBe(defaultValue);
			});
		});

		describe(`enabled`, () => {
			const defaultValue = false;

			it(`should set enabled to defaultValue when option.enabled is not provided`, () => {
				const custom = new LogStateGroup({
					id: 'custom'
				});

				expect(custom.enabled()).toBe(defaultValue);
			});

			it(`should set enabled to true when option.enabled is true`, () => {
				const expected = true;

				const custom = new LogStateGroup({
					id: 'custom',
					enabled: true
				});

				expect(custom.enabled()).toBe(expected);
			});

			it(`should set enabled to false when option.enabled is false`, () => {
				const expected = false;

				const custom = new LogStateGroup({
					id: 'custom',
					enabled: false
				});

				expect(custom.enabled()).toBe(expected);
			});

			it(`should set enabled to defaultValue when option.enabled is non-boolean truthy `, () => {
				const custom = new LogStateGroup({
					id: 'custom',
					enabled: 14971 as any
				});

				expect(custom.enabled()).toBe(defaultValue);
			});
		});

		describe(`level`, () => {
			const defaultValue = Levels.ERROR;

			it(`should set level to defaultValue when option.level is not provided`, () => {
				const custom = new LogStateGroup({
					id: 'custom'
				});

				expect(custom.level()).toBe(defaultValue);
			});

			it(`should set level to '111' when option.level is '111'`, () => {
				const expected = 111;

				const custom = new LogStateGroup({
					id: 'custom',
					level: expected
				});

				expect(custom.level()).toBe(expected);
			});

			it(`should set level to defaultValue when option.level is NaN `, () => {
				const custom = new LogStateGroup({
					id: 'custom',
					level: NaN
				});

				expect(custom.level()).toBe(defaultValue);
			});

			it(`should set level to defaultValue when option.level is a string `, () => {
				const custom = new LogStateGroup({
					id: 'custom',
					level: '14971' as any
				});

				expect(custom.level()).toBe(defaultValue);
			});

			it(`should set level to defaultValue when option.level is a negative number `, () => {
				const custom = new LogStateGroup({
					id: 'custom',
					level: -145
				});

				expect(custom.level()).toBe(defaultValue);
			});
		});

		describe(`transports`, () => {
			it(`should create a set`, () => {
				const custom = new LogStateGroup({
					id: 'custom'
				});

				expect(custom.transports).toBeInstanceOf(Set);
			});
		});
	});
});
