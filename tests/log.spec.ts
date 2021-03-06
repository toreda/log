import {Log} from '../src/log';
import {LogLevels} from '../src/log/levels';
import {LogTransport} from '../src/log/transport';
import {LogAction} from '../src/log/action';
import {LogMessage} from '../src/log/message';
import {LogGroup} from '../src/log/group';

const MOCK_ID = '149714971_92872981';
const MOCK_MSG = 'msg here';
const EMPTY_STRING = '';

const LOG_LEVELS: number[] = [
	LogLevels.ERROR,
	LogLevels.WARN,
	LogLevels.TRACE,
	LogLevels.INFO,
	LogLevels.DEBUG,
	LogLevels.TRACE
];

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

		instance.setGlobalLevel(LogLevels.DEBUG);
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

		describe('setGroupLevel', () => {
			let group: LogGroup;
			const groupId = '19814_77eF971_VAZ714971';

			beforeAll(() => {
				group = instance.getGroup(groupId);
			});

			beforeEach(() => {
				instance.setGroupLevel(groupId, LogLevels.ERROR);
			});

			it('should not change group log level when logLevel arg is undefined', () => {
				const groupId = '97149_974646_MVVCJ196714';
				const group = instance.getGroup(groupId);
				group!.logLevel = LogLevels.TRACE;
				instance.setGroupLevel(groupId, undefined as any);
				expect(group!.logLevel).toBe(LogLevels.TRACE);
			});

			for (const level of LOG_LEVELS) {
				it(`should set group level to ${level} set to ${level}`, () => {
					expect(instance.state.groups[groupId].logLevel).toBe(LogLevels.ERROR);
					instance.setGroupLevel(groupId, level);
					expect(instance.state.groups[groupId].logLevel).toBe(level);
				});
			}
		});

		describe('setGlobalLevel', () => {
			it('should not change log level when logLevel arg is undefined', () => {
				expect(instance.state.globalLogLevel).toBe(LogLevels.DEBUG);
				instance.setGlobalLevel('adfjakha' as any);
				expect(instance.state.globalLogLevel).toBe(LogLevels.DEBUG);
			});

			it('should set global log level to 0 when logLevel arg is NONE', () => {
				expect(instance.state.globalLogLevel).toBe(LogLevels.DEBUG);
				instance.setGlobalLevel(LogLevels.NONE);
				expect(instance.state.globalLogLevel).toBe(0);
			});

			it('should not change global level when logLevel arg is a negative number', () => {
				expect(instance.state.globalLogLevel).toBe(LogLevels.DEBUG);
				instance.setGlobalLevel(-1);
				instance.setGlobalLevel(-41);
				instance.setGlobalLevel(-3);
				expect(instance.state.globalLogLevel).toBe(LogLevels.DEBUG);
			});

			for (const logLevel of LOG_LEVELS) {
				it(`should set log level to ${logLevel}`, () => {
					expect(instance.state.globalLogLevel).toBe(LogLevels.DEBUG);
					instance.setGlobalLevel(logLevel);
					expect(instance.state.globalLogLevel).toBe(logLevel);
				});
			}
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

			it('should not add the same transport more than once', () => {
				const transport = new LogTransport('test', LogLevels.ALL, action);
				const log = new Log();
				log.addTransport(transport);
				for (let i = 0; i < 5; i++) {
					expect(log.addTransport(transport)).toBe(false);
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

			it(`should add transport to 'all' when groupId is null`, () => {
				const transport = new LogTransport('11097141', LogLevels.ALL, action);
				expect(instance.state.groups.all.transports).toHaveLength(0);
				instance.addGroupTransport(null, transport);
				expect(instance.state.groups.all.transports).toHaveLength(1);
			});

			it('should return false when groupId arg is undefined', () => {
				const transport = new LogTransport(MOCK_ID, LogLevels.ALL, action);
				expect(instance.addGroupTransport(undefined as any, transport)).toBe(false);
			});

			it('should return false when groupId arg is not a string and is not null', () => {
				const transport = new LogTransport(MOCK_ID, LogLevels.ALL, action);
				expect(instance.addGroupTransport(8767187182 as any, transport)).toBe(false);
			});
		});

		describe('makeGroup', () => {
			it('should return false when groupId arg is an empty string', () => {
				expect(instance.makeGroup(EMPTY_STRING, LogLevels.DEBUG)).toBe(false);
			});

			it('should return false when groupId already exists', () => {
				const groupId = '194714_8841978AF';
				instance.makeGroup(groupId, LogLevels.DEBUG);
				expect(instance.makeGroup(groupId, LogLevels.DEBUG)).toBe(false);
			});

			it('should return true when groupId is created', () => {
				const groupId = '491719714';
				expect(instance.state.groups[groupId]).toBeUndefined();
				expect(instance.makeGroup(groupId, LogLevels.DEBUG)).toBe(true);
				expect(instance.state.groups[groupId]).toHaveProperty('transports');
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

		describe('removeTransportEverywhere', () => {
			it('should return false when transport is undefined', () => {
				expect(instance.removeTransportEverywhere(undefined as any)).toBe(false);
			});

			it('should return false when transport is null', () => {
				expect(instance.removeTransportEverywhere(null as any)).toBe(false);
			});

			it('should return false when transport arg is provided but is not a LogTransport', () => {
				expect(instance.removeTransportEverywhere(141971 as any)).toBe(false);
			});

			it('should remove target transport from all groups', () => {
				const transport = new LogTransport(MOCK_ID, LogLevels.ALL, action);
				const groupId1 = '14971497_7d7AKHF';
				const groupId2 = '149719971_f7f7AA';
				const groupId3 = '778910891_KHF8M4';

				instance.addGroupTransport(groupId1, transport);
				instance.addGroupTransport(groupId2, transport);
				instance.addGroupTransport(groupId3, transport);

				expect(instance.state.groups[groupId1].transports).toHaveLength(1);
				expect(instance.state.groups[groupId2].transports).toHaveLength(1);
				expect(instance.state.groups[groupId3].transports).toHaveLength(1);

				instance.removeTransportEverywhere(transport);

				expect(instance.state.groups[groupId1].transports).toHaveLength(0);
				expect(instance.state.groups[groupId2].transports).toHaveLength(0);
				expect(instance.state.groups[groupId3].transports).toHaveLength(0);
			});
		});

		describe('getGroup', () => {
			it('should return existing group', () => {
				const groupId = '149714917_9174179';
				const log = new Log();
				const group = log.getGroup(groupId);
				expect(log.getGroup(groupId)).toEqual(group);
			});

			it('should create and return group when groupId does not exist', () => {
				const log = new Log();
				const groupId = '29J09FV100';
				expect(log.state.groups[groupId]).toBeUndefined();
				const group = log.getGroup(groupId);
				expect(group).toBeDefined();
			});
		});

		describe('initGroups', () => {
			let setGroupLevelMock: jest.SpyInstance;

			beforeAll(() => {
				setGroupLevelMock = jest.spyOn(instance, 'setGroupLevel');
			});

			beforeEach(() => {
				setGroupLevelMock.mockClear();
			});

			it('should not call setGroupLevel when groups arg is undefined or null', () => {
				instance.initGroups(undefined);
				instance.initGroups(null as any);
				expect(setGroupLevelMock).not.toHaveBeenCalled();
			});

			it('should not call setGroupLevel when groups arg is not an array', () => {
				instance.initGroups(1971497 as any);
				expect(setGroupLevelMock).not.toHaveBeenCalled();
			});

			it('should not call setGroupLevel when groups is an empty array', () => {
				instance.initGroups([]);
				expect(setGroupLevelMock).not.toHaveBeenCalled();
			});

			it('should not call setGroupLevel for elements missing a groupId string', () => {
				const item1 = {id: 149197 as any, level: LogLevels.ALL};
				const item2 = {id: '499181', level: LogLevels.DEBUG};
				const item3 = {id: 'i6568712867', level: LogLevels.INFO};
				const item4 = {id: 'i6568712867', level: LogLevels.INFO};
				instance.initGroups([item1, item2, item3, item4]);
				expect(setGroupLevelMock).toHaveBeenCalledTimes(3);
			});

			it('should not call setGroupLevel for elements missing a level', () => {
				const item1 = {id: '1490714971', level: 'stringhere' as any};
				const item2 = {id: '499181', level: LogLevels.DEBUG};
				const item3 = {id: 'i6568712867', level: LogLevels.INFO};
				instance.initGroups([item1, item2, item3]);
				expect(setGroupLevelMock).toHaveBeenCalledTimes(2);
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
				const lastMsg = spy.mock.calls[0][1];
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
				const lastMsg = spy.mock.calls[0][1];
				expect(lastMsg.level).toBe(LogLevels.ALL);
				expect(lastMsg.message).toBe(sampleMsg);

				spy.mockRestore();
			});
		});

		describe('Log Level', () => {
			it('should execute transports when group and transport log level are active but global level is 0', () => {
				const activeInactive = jest.fn();
				const transportInactive = new LogTransport('inactive', LogLevels.NONE, activeInactive);
				const actionActive = jest.fn();
				const transportActive = new LogTransport('active', LogLevels.DEBUG, actionActive);
				instance.setGlobalLevel(LogLevels.NONE);
				instance.addGroupTransport('149719_7419', transportInactive);
				instance.addGroupTransport('4741798_8811', transportInactive);

				const gid = '19GHVC_7149714_917477a6333AVH';
				instance.addGroupTransport(gid, transportActive);
				const group = instance.getGroup(gid);
				group.setLogLevel(LogLevels.DEBUG);
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
