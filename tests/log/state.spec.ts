import {LogLevels} from 'src/log/levels';
import {LogOptions} from 'src/log/options';
import {LogState} from 'src/log/state';

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

		it(`should initialize groups member and include 'global' group`, () => {
			const custom = new LogState(options);
			expect(custom.groups).toBeTruthy();
			expect(custom.groups.global).toBeTruthy();
		});

		it(`should initialize groupKeys member and include 'all' key`, () => {
			const custom = new LogState(options);
			expect(Array.isArray(custom.groupKeys)).toBeTruthy();
			expect(custom.groupKeys.includes('all')).toBe(true);
		});

		it(`should initialize groupKeys member and include 'global' key`, () => {
			const custom = new LogState(options);
			expect(Array.isArray(custom.groupKeys)).toBe(true);
			expect(custom.groupKeys.includes('global')).toBe(true);
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
	});

	describe('Implementation', () => {
		describe('createDefaultGroups', () => {
			it('should return keys array', () => {
				expect(Array.isArray(instance.createDefaultGroups().keys)).toBe(true);
			});

			it(`should return 'all' key in keys array`, () => {
				expect(instance.createDefaultGroups().keys.includes('all')).toBe(true);
			});

			it(`should return 'global' key in keys array`, () => {
				expect(instance.createDefaultGroups().keys.includes('global')).toBe(true);
			});
		});
	});
});
