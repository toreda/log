import {LogGroup} from '../../src/log/group';
import {LogLevels} from '../../src/log/levels';
import {LogTransport} from '../../src/log/transport';
import {isType} from '@toreda/strong-types';
import {LogMessage} from '../../src/log/message';
import {LogAction} from '../../src/log/action';

const MOCK_ID = 'group_id_155129414';
const MOCK_LEVEL = LogLevels.NONE | LogLevels.ERROR;

describe('LogGroup', () => {
	let instance: LogGroup;
	let action: LogAction;

	beforeAll(() => {
		instance = new LogGroup(MOCK_ID, MOCK_LEVEL);
		action = async (msg: LogMessage): Promise<boolean> => {
			return true;
		};
	});

	describe('Constructor', () => {
		it('should set group id to provided id arg', () => {
			const id = '1947194714@@@@1';
			const custom = new LogGroup(id, MOCK_LEVEL);
			expect(custom.id).toBe(id);
		});

		it('should set logLevel to provided logLevel arg', () => {
			const sampleLevel = LogLevels.INFO & ~LogLevels.WARN;
			const custom = new LogGroup(MOCK_ID, sampleLevel);
			expect(custom.logLevel).toBe(sampleLevel);
		});

		it('should initialize added to an empty set', () => {
			const custom = new LogGroup(MOCK_ID, MOCK_LEVEL);
			expect(isType(custom.added, Set)).toBe(true);
			expect(custom.added.size).toBe(0);
		});

		it('should initialize transports to an empty array', () => {
			const custom = new LogGroup(MOCK_ID, MOCK_LEVEL);
			expect(Array.isArray(custom.transports)).toBe(true);
			expect(custom.transports).toHaveLength(0);
		});
	});

	describe('Implementation', () => {
		let sampleLogMsg: LogMessage;
		beforeEach(() => {
			sampleLogMsg = {
				date: Date.now().toLocaleString(),
				level: LogLevels.DEBUG,
				message: 'badger-badger-badger-badger-44141'
			};
		});

		describe('log', () => {
			let executeSpy: jest.SpyInstance;
			let logAction: LogAction;
			let testTransport: LogTransport;

			beforeAll(() => {
				executeSpy = jest.spyOn(instance, 'execute');
				logAction = jest.fn();
				testTransport = new LogTransport(MOCK_ID, MOCK_LEVEL, logAction);
			});

			beforeEach(() => {
				executeSpy.mockClear();
			});

			afterAll(() => {
				executeSpy.mockRestore();
			});

			it('should should not attempt to execute any transports when msg level is 0', async () => {
				sampleLogMsg.level = 0x0;
				expect(executeSpy).not.toHaveBeenCalled();
				await instance.log(LogLevels.ALL, sampleLogMsg);
				expect(executeSpy).not.toHaveBeenCalled();
			});
		});

		describe('canExecute', () => {
			it('should return false when msg log level is 0', () => {
				const transport = new LogTransport(MOCK_ID, LogLevels.ALL, action);
				expect(instance.canExecute(transport, LogLevels.ALL, LogLevels.ALL, LogLevels.NONE)).toBe(
					false
				);
			});

			it('should return false when transport arg is undefined', () => {
				expect(
					instance.canExecute(undefined as any, LogLevels.ALL, LogLevels.ALL, LogLevels.ALL)
				).toBe(false);
			});

			it('should return false when transport arg is null', () => {
				expect(instance.canExecute(null as any, LogLevels.ALL, LogLevels.ALL, LogLevels.ALL)).toBe(
					false
				);
			});

			it('should return false when transport arg is not a LogTransport', () => {
				expect(
					instance.canExecute(instance as any, LogLevels.ALL, LogLevels.ALL, LogLevels.ALL)
				).toBe(false);
			});

			it('should return true when transport matches all active log levels', () => {
				const transport = new LogTransport(MOCK_ID, LogLevels.ALL, action);
				expect(instance.canExecute(transport, LogLevels.ALL, LogLevels.NONE, LogLevels.ALL)).toBe(
					true
				);
			});

			it('should return true when transport one active log levels', () => {
				const transport = new LogTransport(MOCK_ID, LogLevels.ERROR, action);
				expect(instance.canExecute(transport, LogLevels.NONE, LogLevels.INFO, LogLevels.INFO)).toBe(
					true
				);
			});

			it('should return true when msg mask matches multiple log levels', () => {
				const levels = LogLevels.ERROR | LogLevels.DEBUG | LogLevels.INFO;
				const transport = new LogTransport(MOCK_ID, levels, action);
				expect(instance.canExecute(transport, LogLevels.ALL, LogLevels.ALL, LogLevels.ALL)).toBe(
					true
				);
			});

			it(`should return false when transport's log levels don't match message levels`, () => {
				const transportLevels = LogLevels.DEBUG | LogLevels.ERROR;
				const messageLevels = LogLevels.TRACE | LogLevels.WARN;
				const transport = new LogTransport(MOCK_ID, transportLevels, action);
				expect(instance.canExecute(transport, LogLevels.NONE, LogLevels.NONE, messageLevels)).toBe(
					false
				);
			});
		});
	});
});
