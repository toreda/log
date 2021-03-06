import {Log} from '../src/log';
import {LogLevels} from '../src/log/levels';
import {LogTransport} from '../src/log/transport';
import {LogAction} from '../src/log/action';
import {LogMessage} from '../src/log/message';

const MOCK_MSG = 'msg here';

const LOG_METHODS = [
	{
		name: 'error',
		level: LogLevels.ERROR,
		groupId: null
	},
	{
		name: 'warn',
		level: LogLevels.WARN,
		groupId: null
	},
	{
		name: 'info',
		level: LogLevels.INFO,
		groupId: null
	},
	{
		name: 'debug',
		level: LogLevels.DEBUG,
		groupId: null
	},
	{
		name: 'trace',
		level: LogLevels.TRACE,
		groupId: null
	},
	{
		name: 'errorGroup',
		level: LogLevels.ERROR,
		groupId: '104814081'
	},
	{
		name: 'warnGroup',
		level: LogLevels.WARN,
		groupId: '4662191908'
	},
	{
		name: 'infoGroup',
		level: LogLevels.INFO,
		groupId: '48719190'
	},
	{
		name: 'debugGroup',
		level: LogLevels.DEBUG,
		groupId: '98198198'
	},
	{
		name: 'traceGroup',
		level: LogLevels.TRACE,
		groupId: '98149814'
	}
];

describe('Log', () => {
	let instance: Log;
	let action: LogAction;
	let transport: LogTransport;

	beforeAll(() => {
		instance = new Log();
	});

	beforeEach(() => {
		action = async (msg: LogMessage): Promise<boolean> => {
			return true;
		};

		transport = new LogTransport('test', LogLevels.ALL, action);
		instance.clearAll();
	});

	describe('Constructor', () => {
		it('should instantiate when no args are given', () => {
			expect(new Log()).toBeInstanceOf(Log);
		});
	});

	describe('Implementation', () => {
		let spy: jest.SpyInstance;
		let action: LogAction;

		beforeEach(() => {
			action = async (msg: LogMessage): Promise<boolean> => {
				return true;
			};
		});

		describe('addTransport', () => {
			it('should return false when transport arg is undefined', () => {
				expect(instance.addTransport(undefined as any)).toBe(false);
			});

			it('should return false when transport arg is null', () => {
				expect(instance.addTransport(null as any)).toBe(false);
			});

			it('should return true when transport is added', () => {
				const transport = new LogTransport('test', LogLevels.ALL, action);

				expect(instance.addTransport(transport)).toBe(true);
			});

			it('should return true each time the same transport is added', () => {
				const transport = new LogTransport('test', LogLevels.ALL, action);
				const log = new Log();
				for (let i = 0; i < 5; i++) {
					expect(log.addTransport(transport)).toBe(true);
				}
			});

			it('should not add the same transport more than once', () => {
				const transport = new LogTransport('test', LogLevels.ALL, action);
				const log = new Log();
				for (let i = 0; i < 5; i++) {
					expect(log.addTransport(transport)).toBe(true);
				}
			});
		});

		describe('addGroupTransport', () => {
			it('should create group and add transport when group does not exist', () => {
				const groupId = '@97141876';
				const transport = new LogTransport('test', LogLevels.ALL, action);
				instance.addGroupTransport(groupId, transport);
				const group = instance.state.groups[groupId];
				expect(group).not.toBeUndefined();
				expect(Array.isArray(group.transports)).toBe(true);
				expect(group.transports[0]).toBe(transport);
			});

			it('should return true when add transport is successful', () => {
				const groupId = '@97141876';
				const transport = new LogTransport('id', LogLevels.ALL, action);
				expect(instance.addGroupTransport(groupId, transport)).toBe(true);
			});

			it('should return false and should not add a transport when transport arg is undefined', () => {
				const groupId = '90249274';
				const group = instance.getGroup(groupId);
				expect(group!.transports).toHaveLength(0);
				expect(instance.addGroupTransport(groupId, undefined as any)).toBe(false);
				expect(group!.transports).toHaveLength(0);
			});

			it('should return false and should not add a transport when transport arg is null', () => {
				const groupId = '30891408';
				const group = instance.getGroup(groupId);
				expect(group!.transports).toHaveLength(0);
				expect(instance.addGroupTransport(groupId, null as any)).toBe(false);
				expect(group!.transports).toHaveLength(0);
			});
		});

		describe('removeTransport', () => {
			it('should return false when target transport does not exist in default group', () => {
				const transport = new LogTransport('id', LogLevels.ALL, action);
				const log = new Log();
				expect(log.removeTransport(transport)).toBe(false);
			});

			it('should return false when transport arg is undefined', () => {
				const log = new Log();
				expect(log.removeTransport(undefined as any)).toBe(false);
			});

			it('should remove target transport from default group', () => {
				const transport = new LogTransport('id', LogLevels.ALL, action);
				const log = new Log();
				expect(log.state.groups.all.transports).toHaveLength(0);
				log.addTransport(transport);
				expect(log.state.groups.all.transports).toHaveLength(1);
				log.removeTransport(transport);
				expect(log.state.groups.all.transports).toHaveLength(0);
			});

			it('should return true when target transport is removed from default group', () => {
				const transport = new LogTransport('test', LogLevels.ALL, action);
				const log = new Log();
				expect(log.state.groups.all.transports).toHaveLength(0);
				log.addTransport(transport);
				expect(log.state.groups.all.transports).toHaveLength(1);
				const result = log.removeTransport(transport);
				expect(log.state.groups.all.transports).toHaveLength(0);
				expect(result).toBe(true);
			});
		});

		describe('getGroup', () => {
			it('should return null when groupId arg is undefined', () => {
				expect(instance.getGroup(undefined as any)).toBeNull();
			});

			it('should return null when groupId arg is null', () => {
				expect(instance.getGroup(null as any)).toBeNull();
			});

			it('should create and return group when groupId does not exist', () => {
				const log = new Log();
				const groupId = '29J09FV100';
				expect(log.state.groups[groupId]).toBeUndefined();
				const group = log.getGroup(groupId);
				expect(group).toBeDefined();
			});
		});

		describe('log', () => {
			it('should send log to target group when groupId is non-null', () => {
				const groupId = '149719714';
				const sampleMsg = 'badger-badger-badger-badger';
				const custom = new Log();
				custom.getGroup(groupId);
				const spy = jest.spyOn(custom.state.groups[groupId], 'log');

				custom.log(groupId, LogLevels.ALL, sampleMsg);
				expect(spy).toHaveBeenCalledTimes(1);
				const lastMsg = spy.mock.calls[0][0];
				expect(lastMsg.level).toBe(LogLevels.ALL);
				expect(lastMsg.message).toBe(sampleMsg);

				spy.mockRestore();
			});

			it(`should send log to 'all' group when groupId arg is null`, () => {
				const log = new Log();
				const sampleMsg = 'aaaaaa14145';
				const spy = jest.spyOn(log.state.groups.all, 'log');
				log.log(null, LogLevels.ALL, sampleMsg);
				expect(spy).toHaveBeenCalledTimes(1);
				const lastMsg = spy.mock.calls[0][0];
				expect(lastMsg.level).toBe(LogLevels.ALL);
				expect(lastMsg.message).toBe(sampleMsg);

				spy.mockRestore();
			});
		});

		describe('Log Methods', () => {
			let logSpy: jest.SpyInstance;

			beforeAll(() => {
				logSpy = jest.spyOn(instance, 'log');
			});

			beforeEach(() => {
				logSpy.mockClear();
				expect(logSpy).not.toHaveBeenCalled();
			});

			afterAll(() => {
				logSpy.mockRestore();
			});

			for (const method of LOG_METHODS) {
				describe(`${method.name} method`, () => {
					it('should call log method exactly once', () => {
						if (method.groupId === null) {
							instance[method.name](MOCK_MSG);
						} else {
							instance[method.name](method.groupId, MOCK_MSG);
						}

						expect(logSpy).toHaveBeenCalledTimes(1);
					});

					it(`should pass '${method.groupId}' groupId to log method`, () => {
						if (method.groupId === null) {
							instance[method.name](MOCK_MSG);
						} else {
							instance[method.name](method.groupId, MOCK_MSG);
						}

						expect(logSpy).toHaveBeenLastCalledWith(
							method.groupId,
							expect.anything(),
							expect.anything()
						);
						expect(logSpy).toHaveBeenCalledTimes(1);
					});

					it(`should pass log level '${method.level}' to log method`, () => {
						if (method.groupId === null) {
							instance[method.name](MOCK_MSG);
						} else {
							instance[method.name](method.groupId, MOCK_MSG);
						}

						expect(logSpy).toHaveBeenLastCalledWith(
							method.groupId,
							method.level,
							expect.anything()
						);
						expect(logSpy).toHaveBeenCalledTimes(1);
					});

					it('should pass msg to log method', () => {
						const sampleMsg = 'AAA0814108';

						if (method.groupId === null) {
							instance[method.name](sampleMsg);
						} else {
							instance[method.name](method.groupId, sampleMsg);
						}

						expect(logSpy).toHaveBeenLastCalledWith(method.groupId, expect.anything(), sampleMsg);
						expect(logSpy).toHaveBeenCalledTimes(1);
					});
				});
			}
		});
	});
});
