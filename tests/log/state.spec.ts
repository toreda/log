import {LogLevels} from '../../src/log/levels';
import {LogOptions} from '../../src/log/options';
import {LogState} from '../../src/log/state';

describe('LogState', () => {
	let instance: LogState;
	let options: LogOptions;
	const levelErr: LogLevels = LogLevels.NONE | LogLevels.ERROR;

	beforeAll(() => {
		instance = new LogState();
	});

	beforeEach(() => {
		options = {
			globalLogLevel: levelErr
		};
	});

	describe('Constructor', () => {
		it(`should initialize groups member and include 'all' group`, () => {
			const custom = new LogState(options);
			expect(custom.groups).toBeTruthy();
			expect(custom.groups.all).toBeTruthy();
		});

		it(`should initialize groups member and include 'default' group`, () => {
			const custom = new LogState(options);
			expect(custom.groups).toBeTruthy();
			expect(custom.groups.default).toBeTruthy();
		});

		it(`should initialize groupKeys member and include 'all' key`, () => {
			const custom = new LogState(options);
			expect(Array.isArray(custom.groupKeys)).toBeTruthy();
			expect(custom.groupKeys.includes('all')).toBe(true);
		});

		it(`should initialize groupKeys member and include 'default' key`, () => {
			const custom = new LogState(options);
			expect(Array.isArray(custom.groupKeys)).toBe(true);
			expect(custom.groupKeys.includes('default')).toBe(true);
		});

		it(`should default consoleEnabled to false when option.consoleEnabled is not provided`, () => {
			const custom = new LogState({
				globalLogLevel: LogLevels.ERROR
			});
			expect(custom.consoleEnabled()).toBe(false);
		});

		it(`should set consoleEnabled to false when option.consoleEnabled is false`, () => {
			const custom = new LogState({
				globalLogLevel: LogLevels.ERROR,
				consoleEnabled: false
			});
			expect(custom.consoleEnabled()).toBe(false);
		});

		it(`should set consoleEnabled to true when option.consoleEnabled is true`, () => {
			const custom = new LogState({
				globalLogLevel: LogLevels.ERROR,
				consoleEnabled: true
			});
			expect(custom.consoleEnabled()).toBe(true);
		});

		it(`should set consoleEnabled to false when option.consoleEnabled is non-boolean truthy `, () => {
			const custom = new LogState({
				globalLogLevel: LogLevels.ERROR,
				consoleEnabled: 14971 as any
			});

			expect(custom.consoleEnabled()).toBe(false);
		});

		it(`should set groups with keys 'all' and 'default' when options.startingGroups is undefined`, () => {
			const custom = new LogState();

			expect(custom.groups.all).toBeDefined();
			expect(custom.groupKeys.includes('all')).toBeTruthy();
			expect(custom.groups.default).toBeDefined();
			expect(custom.groupKeys.includes('default')).toBeTruthy();
			expect(custom.groups.custom).toBeUndefined();
			expect(custom.groupKeys.includes('custom')).toBeFalsy();
		});

		it(`should set groups with keys 'all' and 'default' and 'custom' when options.startingGroups has 'custom'`, () => {
			const custom = new LogState({
				startingGroups: [{id: 'custom', level: 489, enabled: true}, {id: 'basic'}]
			});

			expect(custom.groups.all).toBeDefined();
			expect(custom.groupKeys.includes('all')).toBeTruthy();
			expect(custom.groups.default).toBeDefined();
			expect(custom.groupKeys.includes('default')).toBeTruthy();
			expect(custom.groups.custom).toBeDefined();
			expect(custom.groupKeys.includes('custom')).toBeTruthy();
			expect(custom.groups.custom).toBeDefined();
			expect(custom.groupKeys.includes('basic')).toBeTruthy();
		});
	});

	describe('Implementation', () => {
		describe('createGroups', () => {
			it(`should return 'all' group in result record`, () => {
				const result = instance['createGroups']();

				expect(result['all']).toBeDefined();
				expect(result['custom']).toBeUndefined();
			});

			it(`should return 'default' group in result record`, () => {
				const result = instance['createGroups']();

				expect(result['default']).toBeDefined();
				expect(result['custom']).toBeUndefined();
			});

			it(`should return 'custom' group in result record`, () => {
				const custom = {id: 'custom', level: 555};

				const result = instance['createGroups']([custom]);

				expect(result['custom']).toBeDefined();
				expect(result['all']).toBeDefined();
				expect(result['default']).toBeDefined();
			});
		});
	});
});
