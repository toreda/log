import {isType} from '@toreda/strong-types';
import {LogAction} from '../../src/log/action';
import {LogGroup} from '../../src/log/group';
import {LogLevels} from '../../src/log/levels';
import {LogMessage} from '../../src/log/message';
import {LogTransport} from '../../src/log/transport';

const MOCK_ID = 'group_id_155129414';
const MOCK_LEVEL = LogLevels.NONE | LogLevels.ERROR;

describe('LogGroup', () => {
	let instance: LogGroup;
	let action: LogAction;

	beforeAll(() => {
		instance = new LogGroup(MOCK_ID, MOCK_LEVEL, true);
		action = async (): Promise<boolean> => {
			return true;
		};
	});

	describe('Constructor', () => {
		it('should set group id to provided id arg', () => {
			const id = '1947194714@@@@1';
			const custom = new LogGroup(id, MOCK_LEVEL, true);
			expect(custom.id).toBe(id);
		});

		it('should set logLevel to provided logLevel arg', () => {
			const sampleLevel = LogLevels.INFO & ~LogLevels.WARN;
			const custom = new LogGroup(MOCK_ID, sampleLevel, true);
			expect(custom.logLevel()).toBe(sampleLevel);
		});

		it('should initialize added to an empty set', () => {
			const custom = new LogGroup(MOCK_ID, MOCK_LEVEL, true);
			expect(isType(custom.added, Set)).toBe(true);
			expect(custom.added.size).toBe(0);
		});

		it('should initialize transports to an empty array', () => {
			const custom = new LogGroup(MOCK_ID, MOCK_LEVEL, true);
			expect(Array.isArray(custom.transports)).toBe(true);
			expect(custom.transports).toHaveLength(0);
		});

		it('should initialize enabled to true', () => {
			const custom = new LogGroup(MOCK_ID, MOCK_LEVEL, true);
			expect(custom.enabled()).toBe(true);
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
			let logAction: jest.MockedFunction<LogAction>;
			let testTransport1: LogTransport;
			let testTransport2: LogTransport;
			let testTransport3: LogTransport;

			beforeAll(() => {
				executeSpy = jest.spyOn(instance as any, 'execute');
				logAction = jest.fn();
				testTransport1 = new LogTransport(MOCK_ID, LogLevels.DEBUG, logAction);
				testTransport2 = new LogTransport(MOCK_ID, LogLevels.DEBUG, logAction);
				testTransport3 = new LogTransport(MOCK_ID, LogLevels.ERROR, logAction);
				instance.addTransport(testTransport1);
				instance.addTransport(testTransport2);
				instance.addTransport(testTransport3);
			});

			beforeEach(() => {
				executeSpy.mockClear();
				logAction.mockClear();
			});

			afterAll(() => {
				executeSpy.mockRestore();
				instance.removeTransports([testTransport1, testTransport2, testTransport3]);
			});

			it('should not attempt to execute any transports when msg level is 0', async () => {
				sampleLogMsg.level = 0x0;
				expect(executeSpy).not.toHaveBeenCalled();
				await instance.log(LogLevels.ALL, sampleLogMsg);
				expect(executeSpy).not.toHaveBeenCalled();
			});

			it('should not attempt to execute any transports when log is not enabled', async () => {
				instance.enabled(false);
				expect(executeSpy).not.toHaveBeenCalled();
				await instance.log(LogLevels.ALL, sampleLogMsg);
				expect(executeSpy).not.toHaveBeenCalled();
				instance.enabled(true);
			});

			it('should only execute transports matching log level', async () => {
				sampleLogMsg.level = LogLevels.DEBUG;
				expect(logAction).not.toHaveBeenCalled();
				// Turning off group logging for this test.
				instance.setLogLevel(LogLevels.NONE);

				await instance.log(LogLevels.NONE, sampleLogMsg);
				expect(logAction).toHaveBeenCalledTimes(2);
			});
		});

		describe('removeTransports', () => {
			it('should return false when transports is not an array', () => {
				expect(instance.removeTransports(91714497 as any)).toBe(false);
				expect(instance.removeTransports({} as any)).toBe(false);
				expect(instance.removeTransports(true as any)).toBe(false);
			});

			it('should return false when transports arg is an empty array', () => {
				expect(instance.removeTransports([])).toBe(false);
			});

			it('should return true after removing a transport', () => {
				const transport = new LogTransport('id', LogLevels.INFO, action);
				instance.addTransport(transport);
				expect(instance.removeTransports([transport])).toBe(true);
			});

			it('should return true after removing multiple transports', () => {
				const transportA = new LogTransport('id', LogLevels.INFO, action);
				const transportB = new LogTransport('id', LogLevels.INFO, action);
				const transportC = new LogTransport('id', LogLevels.INFO, action);

				instance.addTransport(transportA);
				instance.addTransport(transportB);
				instance.addTransport(transportC);
				expect(instance.transports.includes(transportA)).toBe(true);
				expect(instance.transports.includes(transportB)).toBe(true);
				expect(instance.transports.includes(transportC)).toBe(true);
				expect(instance.removeTransports([transportA, transportB, transportC])).toBe(true);

				expect(instance.transports.includes(transportA)).toBe(false);
				expect(instance.transports.includes(transportB)).toBe(false);
				expect(instance.transports.includes(transportC)).toBe(false);
			});

			it('should only removing matching transports', () => {
				const transportA = new LogTransport('id', LogLevels.INFO, action);
				const transportB = new LogTransport('id', LogLevels.INFO, action);
				const transportC = new LogTransport('id', LogLevels.INFO, action);

				instance.addTransport(transportA);
				instance.addTransport(transportB);
				instance.addTransport(transportC);

				expect(instance.transports.includes(transportA)).toBe(true);
				expect(instance.transports.includes(transportB)).toBe(true);
				expect(instance.transports.includes(transportC)).toBe(true);

				expect(instance.removeTransports([transportA, transportC])).toBe(true);

				expect(instance.transports.includes(transportA)).toBe(false);
				expect(instance.transports.includes(transportB)).toBe(true);
				expect(instance.transports.includes(transportC)).toBe(false);
			});
		});

		describe('canExecute', () => {
			beforeEach(() => {
				instance.logLevel(MOCK_LEVEL);
			});

			afterAll(() => {
				instance.logLevel(MOCK_LEVEL);
			});

			it('should return false when global and transport log levels are not number', () => {
				const transport = new LogTransport(MOCK_ID, 'a917afJHF' as any, action);
				const msgLevel = LogLevels.DEBUG;
				expect(instance['canExecute'](transport, 'FJ678194_HR719971' as any, msgLevel)).toBe(false);
			});

			it('should return false when log is not enabled', () => {
				const transport = new LogTransport(MOCK_ID, LogLevels.ERROR, action);
				const msgLevel = LogLevels.ERROR;
				instance.enabled(false);
				expect(instance['canExecute'](transport, LogLevels.DEBUG, msgLevel)).toBe(false);
				instance.enabled(true);
			});

			it('should return true when global level matches msg level but transport level is a non-number', () => {
				const transport = new LogTransport(MOCK_ID, 'a917afJHF' as any, action);
				const msgLevel = LogLevels.DEBUG;
				expect(instance['canExecute'](transport, LogLevels.DEBUG, msgLevel)).toBe(true);
			});

			it('should return true when group level matches msg level but transport and global levels are non-numbers', () => {
				const transport = new LogTransport(MOCK_ID, 'LAnvalk11974197' as any, action);
				const msgLevel = LogLevels.TRACE;
				instance.logLevel(msgLevel);
				expect(instance['canExecute'](transport, 'LJFA974197' as any, msgLevel)).toBe(true);
			});

			it('should return true when transport level matches msg level but global level is a non-number', () => {
				const transport = new LogTransport(MOCK_ID, LogLevels.ERROR, action);
				const msgLevel = LogLevels.ERROR;
				expect(instance['canExecute'](transport, 'LJFA974197' as any, msgLevel)).toBe(true);
			});

			it('should return false when msg log level is 0', () => {
				const transport = new LogTransport(MOCK_ID, LogLevels.ALL, action);
				expect(instance['canExecute'](transport, LogLevels.ALL, LogLevels.NONE)).toBe(false);
			});

			it('should return false when transport arg is undefined', () => {
				expect(instance['canExecute'](undefined as any, LogLevels.ALL, LogLevels.ALL)).toBe(false);
			});

			it('should return false when transport arg is null', () => {
				expect(instance['canExecute'](null as any, LogLevels.ALL, LogLevels.ALL)).toBe(false);
			});

			it('should return false when transport arg is not a LogTransport', () => {
				expect(instance['canExecute'](instance as any, LogLevels.ALL, LogLevels.ALL)).toBe(false);
			});

			it('should return true when transport matches all active log levels', () => {
				const transport = new LogTransport(MOCK_ID, LogLevels.ALL, action);
				const msgLevels = LogLevels.INFO | LogLevels.ERROR | LogLevels.TRACE;
				expect(instance['canExecute'](transport, LogLevels.ALL, msgLevels)).toBe(true);
			});

			it('should return true when transport one active log levels', () => {
				const transport = new LogTransport(MOCK_ID, LogLevels.ERROR, action);
				instance.logLevel(LogLevels.INFO);
				expect(instance['canExecute'](transport, LogLevels.NONE, LogLevels.INFO)).toBe(true);
			});

			it('should return true when msg mask matches multiple log levels', () => {
				const levels = LogLevels.ERROR | LogLevels.DEBUG | LogLevels.INFO;
				const transport = new LogTransport(MOCK_ID, levels, action);
				expect(instance['canExecute'](transport, LogLevels.ALL, levels)).toBe(true);
			});

			it(`should return false when transport's log levels don't match message levels`, () => {
				const transportLevels = LogLevels.DEBUG | LogLevels.ERROR;
				const messageLevels = LogLevels.TRACE | LogLevels.WARN;
				const transport = new LogTransport(MOCK_ID, transportLevels, action);
				expect(instance['canExecute'](transport, LogLevels.NONE, messageLevels)).toBe(false);
			});
		});
	});
});
