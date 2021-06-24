import {Log} from '../src/log';
import {LogAction} from '../src/log/action';
import {LogLevels} from '../src/log/levels';
import {
	LogLevelDisable,
	LogLevelDisableMultiple,
	LogLevelEnable,
	LogLevelEnableMultiple
} from '../src/log/levels/helpers';
import {LogTransport} from '../src/log/transport';

jest.mock('../src/log/levels/helpers');

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
		id: 'default'
	},
	{
		name: 'warn',
		level: LogLevels.WARN,
		id: 'default'
	},
	{
		name: 'info',
		level: LogLevels.INFO,
		id: 'default'
	},
	{
		name: 'debug',
		level: LogLevels.DEBUG,
		id: 'default'
	},
	{
		name: 'trace',
		level: LogLevels.TRACE,
		id: 'default'
	},
	{
		name: 'errorTo',
		level: LogLevels.ERROR,
		id: '104814081'
	},
	{
		name: 'warnTo',
		level: LogLevels.WARN,
		id: '4662191908'
	},
	{
		name: 'infoTo',
		level: LogLevels.INFO,
		id: '48719190'
	},
	{
		name: 'debugTo',
		level: LogLevels.DEBUG,
		id: '98198198'
	},
	{
		name: 'traceTo',
		level: LogLevels.TRACE,
		id: '98149814'
	}
];

describe('Log', () => {
	let log: Log;

	beforeAll(() => {
		log = new Log();
	});

	beforeEach(() => {
		log.setGlobalLevel(LogLevels.DEBUG);
		log.clearAll();
	});

	describe('Constructor', () => {
		it('should instantiate when no args are given', () => {
			expect(new Log()).toBeInstanceOf(Log);
		});

		it(`should add a transport to 'default' if 'consoleEnabled' is true`, () => {
			const custom = new Log({consoleEnabled: true});

			expect(custom.state.groups.default.transports.length).toBe(1);
		});
	});

	describe('Implementation', () => {
		let action: LogAction;

		beforeEach(() => {
			log.clearAll();
			action = async (): Promise<boolean> => {
				return true;
			};
		});

		describe(`activateDefaultConsole`, () => {
			it(`should create a transport with level arg`, () => {
				const level = 13;
				expect(level).not.toBe(log.state.globalLogLevel());

				log.activateDefaultConsole(level);

				expect(log.getGroup().transports[0].level).toBe(level);
			});
		});

		describe('makeGroup', () => {
			it('should return false when id arg is an empty string', () => {
				expect(log.makeGroup({id: EMPTY_STRING, level: LogLevels.DEBUG})).toBe(false);
			});

			it('should return false when id already exists', () => {
				const id = '194714_8841978AF';
				log.makeGroup({id, level: LogLevels.DEBUG});
				expect(log.makeGroup({id, level: LogLevels.DEBUG})).toBe(false);
			});

			it('should return true when id is created', () => {
				const id = '491719714';
				expect(log.state.groups[id]).toBeUndefined();
				expect(log.makeGroup({id, level: LogLevels.DEBUG})).toBe(true);
				expect(log.state.groups[id]).toHaveProperty('transports');
			});
		});

		describe('getGroup', () => {
			it('should return existing group', () => {
				const id = '149714917_9174179';
				log.makeGroup({id});
				expect(log.getGroup(id, false)).toEqual(log.state.groups[id]);
			});

			it('should create and return group when id does not exist', () => {
				const id = '29J09FV100';
				expect(log.state.groups[id]).toBeUndefined();
				const group = log.getGroup(id, true);
				expect(group).toBeDefined();
			});
		});

		describe('initGroups', () => {
			let setGroupLevelMock: jest.SpyInstance;

			beforeAll(() => {
				setGroupLevelMock = jest.spyOn(log, 'setGroupLevel');
			});

			beforeEach(() => {
				setGroupLevelMock.mockClear();
			});

			it('should not call setGroupLevel when groups arg is undefined or null', () => {
				log.initGroups(undefined);
				log.initGroups(null as any);
				expect(setGroupLevelMock).not.toHaveBeenCalled();
			});

			it('should not call setGroupLevel when groups arg is not an array', () => {
				log.initGroups(1971497 as any);
				expect(setGroupLevelMock).not.toHaveBeenCalled();
			});

			it('should not call setGroupLevel when groups is an empty array', () => {
				log.initGroups([]);
				expect(setGroupLevelMock).not.toHaveBeenCalled();
			});

			it('should not call setGroupLevel for elements missing a id string', () => {
				const item1 = {id: 149197 as any, level: LogLevels.ALL};
				const item2 = {id: '499181', level: LogLevels.DEBUG};
				const item3 = {id: 'i6568712867', level: LogLevels.INFO};
				const item4 = {id: 'i6568712867', level: LogLevels.INFO};
				log.initGroups([item1, item2, item3, item4]);
				expect(setGroupLevelMock).toHaveBeenCalledTimes(3);
			});

			it('should not call setGroupLevel for elements missing a level', () => {
				const item1 = {id: '1490714971', level: 'stringhere' as any};
				const item2 = {id: '499181', level: LogLevels.DEBUG};
				const item3 = {id: 'i6568712867', level: LogLevels.INFO};
				log.initGroups([item1, item2, item3]);
				expect(setGroupLevelMock).toHaveBeenCalledTimes(2);
			});
		});

		describe('addTransport', () => {
			it('should create group and add transport when group does not exist', () => {
				const id = '@97141876';
				const transport = new LogTransport('test', LogLevels.ALL, action);
				log.addTransport(transport, id);
				const group = log.state.groups[id];

				expect(group).not.toBeUndefined();
				expect(Array.isArray(group.transports)).toBe(true);
				expect(group.transports[0]).toBe(transport);
			});

			it('should not add the same transport more than once', () => {
				const transport = new LogTransport('test', LogLevels.ALL, action);
				log.addTransport(transport);
				for (let i = 0; i < 5; i++) {
					expect(log.addTransport(transport)).toBe(false);
				}
			});

			it('should return false and should not add a transport when transport arg is undefined', () => {
				const group = log.getGroup();
				expect(group.transports).toHaveLength(0);
				expect(log.addTransport(undefined as any)).toBe(false);
				expect(group.transports).toHaveLength(0);
			});

			it('should return false and should not add a transport when transport arg is null', () => {
				const group = log.getGroup();
				expect(group.transports).toHaveLength(0);
				expect(log.addTransport(null as any)).toBe(false);
				expect(group.transports).toHaveLength(0);
			});

			it(`should add transport to 'default' when id is undefined`, () => {
				const transport = new LogTransport('11097141', LogLevels.ALL, action);
				expect(log.state.groups.default.transports).toHaveLength(0);
				log.addTransport(transport);
				expect(log.state.groups.default.transports).toHaveLength(1);
			});
		});

		describe('removeTransport', () => {
			it('should return false when target transport does not exist in default group', () => {
				const transport = new LogTransport('id', LogLevels.ALL, action);
				expect(log.removeTransport(transport)).toBe(false);
			});

			it('should return false when transport arg is undefined', () => {
				expect(log.removeTransport(undefined as any)).toBe(false);
			});

			it('should remove target transport from default group', () => {
				const transport = new LogTransport('id', LogLevels.ALL, action);
				expect(log.state.groups.default.transports).toHaveLength(0);
				log.addTransport(transport);
				expect(log.state.groups.default.transports).toHaveLength(1);
				log.removeTransport(transport);
				expect(log.state.groups.default.transports).toHaveLength(0);
			});

			it('should return true when target transport is removed from default group', () => {
				const transport = new LogTransport('test', LogLevels.ALL, action);
				expect(log.state.groups.default.transports).toHaveLength(0);
				log.addTransport(transport);
				expect(log.state.groups.default.transports).toHaveLength(1);
				const result = log.removeTransport(transport);
				expect(log.state.groups.default.transports).toHaveLength(0);
				expect(result).toBe(true);
			});
		});

		describe('removeTransportById', () => {
			it('should remove target transport from default group', () => {
				const transport = new LogTransport('id', LogLevels.ALL, action);
				expect(log.state.groups.default.transports).toHaveLength(0);
				log.addTransport(transport);
				expect(log.state.groups.default.transports).toHaveLength(1);
				const result = log.removeTransportById('id');
				expect(log.state.groups.default.transports).toHaveLength(0);
				expect(result).toBeTruthy();
			});

			it('should return false if no transports are removed', () => {
				const transport = new LogTransport('id', LogLevels.ALL, action);
				expect(log.state.groups.default.transports).toHaveLength(0);
				log.addTransport(transport);
				expect(log.state.groups.default.transports).toHaveLength(1);
				const result = log.removeTransportById('id2');
				expect(log.state.groups.default.transports).toHaveLength(1);
				expect(result).toBeFalsy();
			});
		});

		describe('removeTransportEverywhere', () => {
			it('should return false when transport is undefined', () => {
				expect(log.removeTransportEverywhere(undefined as any)).toBe(false);
			});

			it('should return false when transport is null', () => {
				expect(log.removeTransportEverywhere(null as any)).toBe(false);
			});

			it('should return false when transport arg is provided but is not a LogTransport', () => {
				expect(log.removeTransportEverywhere(141971 as any)).toBe(false);
			});

			it('should remove target transport from all groups', () => {
				const transport = new LogTransport(MOCK_ID, LogLevels.ALL, action);
				const id1 = '14971497_7d7AKHF';
				const id2 = '149719971_f7f7AA';
				const id3 = '778910891_KHF8M4';

				log.addTransport(transport, id1);
				log.addTransport(transport, id2);
				log.addTransport(transport, id3);

				expect(log.state.groups[id1].transports).toHaveLength(1);
				expect(log.state.groups[id2].transports).toHaveLength(1);
				expect(log.state.groups[id3].transports).toHaveLength(1);

				log.removeTransportEverywhere(transport);

				expect(log.state.groups[id1].transports).toHaveLength(0);
				expect(log.state.groups[id2].transports).toHaveLength(0);
				expect(log.state.groups[id3].transports).toHaveLength(0);
			});
		});

		describe(`global log levels`, () => {
			describe('setGlobalLevel', () => {
				it('should not change log level when logLevel arg is undefined', () => {
					expect(log.state.globalLogLevel()).toBe(LogLevels.DEBUG);
					log.setGlobalLevel('adfjakha' as any);
					expect(log.state.globalLogLevel()).toBe(LogLevels.DEBUG);
				});

				it('should set global log level to 0 when logLevel arg is NONE', () => {
					expect(log.state.globalLogLevel()).toBe(LogLevels.DEBUG);
					log.setGlobalLevel(LogLevels.NONE);
					expect(log.state.globalLogLevel()).toBe(0);
				});

				for (const logLevel of LOG_LEVELS) {
					it(`should set log level to ${logLevel}`, () => {
						expect(log.state.globalLogLevel()).toBe(LogLevels.DEBUG);
						log.setGlobalLevel(logLevel);
						expect(log.state.globalLogLevel()).toBe(logLevel);
					});
				}
			});

			it(`should call LogLevelEnable`, () => {
				log.enableGlobalLevel(1);

				expect(LogLevelEnable).toBeCalled();
			});

			it(`should call LogLevelEnableMultiple`, () => {
				log.enableGlobalLevels([1]);

				expect(LogLevelEnableMultiple).toBeCalled();
			});

			it(`should call LogLevelDisable`, () => {
				log.disableGlobalLevel(1);

				expect(LogLevelDisable).toBeCalled();
			});

			it(`should call LogLevelDisableMultiple`, () => {
				log.disableGlobalLevels([1]);

				expect(LogLevelDisableMultiple).toBeCalled();
			});
		});

		describe(`group log levels`, () => {
			describe('setGroupLevel', () => {
				const id = '19814_77eF971_VAZ714971';

				beforeEach(() => {
					log.makeGroup({id: id, level: 0});
					log.setGroupLevel(LogLevels.ERROR, id);
				});

				it('should not change group log level when logLevel arg is undefined', () => {
					const id = '97149_974646_MVVCJ196714';
					const group = log.getGroup(id, true);
					group.logLevel(LogLevels.TRACE);
					log.setGroupLevel(undefined as any, id);
					expect(group.logLevel()).toBe(LogLevels.TRACE);
				});

				for (const level of LOG_LEVELS) {
					it(`should set group level to ${level} set to ${level}`, () => {
						expect(log.state.groups[id].logLevel()).toBe(LogLevels.ERROR);
						log.setGroupLevel(level, id);
						expect(log.state.groups[id].logLevel()).toBe(level);
					});
				}
			});

			it(`should call LogLevelEnable`, () => {
				log.enableGroupLevel(1);

				expect(LogLevelEnable).toBeCalled();
			});

			it(`should call LogLevelEnableMultiple`, () => {
				log.enableGroupLevels([1]);

				expect(LogLevelEnableMultiple).toBeCalled();
			});

			it(`should call LogLevelDisable`, () => {
				log.disableGroupLevel(1);

				expect(LogLevelDisable).toBeCalled();
			});

			it(`should call LogLevelDisableMultiple`, () => {
				log.disableGroupLevels([1]);

				expect(LogLevelDisableMultiple).toBeCalled();
			});
		});

		describe(`createMessage`, () => {
			const date = '';
			const level = 1;

			it(`should return with a string message if msg.length > 1`, () => {
				const result = log['createMessage'](date, level, 1, 2, 3, 4);

				expect(typeof result.message).toBe('string');
			});

			it(`should return with a string message if msg.length === 0`, () => {
				const result = log['createMessage'](date, level);

				expect(typeof result.message).toBe('string');
			});

			it(`should return with a string message if msg is a single string`, () => {
				const result = log['createMessage'](date, level, 'single string message');

				expect(typeof result.message).toBe('string');
			});

			it(`should return with a string message if msg is a single non string`, () => {
				const result = log['createMessage'](date, level, {a: 'b'});

				expect(typeof result.message).toBe('string');
			});
		});

		describe('log', () => {
			it('should send log to `default` group', () => {
				const sampleMsg = 'badger-badger-badger-badger';
				log.getGroup();
				const spy = jest.spyOn(log.state.groups.default, 'log');

				log.log(LogLevels.ALL, sampleMsg);
				expect(spy).toHaveBeenCalledTimes(1);
				const lastMsg = spy.mock.calls[0][1];
				expect(lastMsg.level).toBe(LogLevels.ALL);
				expect(lastMsg.message).toBe(sampleMsg);

				spy.mockRestore();
			});

			it(`should send log to 'all' group`, () => {
				const sampleMsg = 'aaaaaa14145';
				const spy = jest.spyOn(log.state.groups.all, 'log');
				log.log(LogLevels.ALL, sampleMsg);
				expect(spy).toHaveBeenCalledTimes(1);
				const lastMsg = spy.mock.calls[0][1];
				expect(lastMsg.level).toBe(LogLevels.ALL);
				expect(lastMsg.message).toBe(sampleMsg);

				spy.mockRestore();
			});
		});

		describe('logTo', () => {
			it('should send log to target group', () => {
				const id = '75984231';
				const sampleMsg = 'owl-monkey-badger-tree';
				log.makeGroup({id, level: 0xff});
				const spy = jest.spyOn(log.state.groups[id], 'log');

				log.logTo(id, LogLevels.ALL, sampleMsg);
				expect(spy).toHaveBeenCalledTimes(1);
				const lastMsg = spy.mock.calls[0][1];
				expect(lastMsg.level).toBe(LogLevels.ALL);
				expect(lastMsg.message).toBe(sampleMsg);

				spy.mockRestore();
			});

			it(`should send log to 'all' group`, () => {
				const id = 'a456as6';
				const sampleMsg = 'aadfaa118845';
				log.makeGroup({id, level: 0xff});
				const spy = jest.spyOn(log.state.groups.all, 'log');

				log.logTo(id, LogLevels.ALL, sampleMsg);
				expect(spy).toHaveBeenCalledTimes(1);
				const lastMsg = spy.mock.calls[0][1];
				expect(lastMsg.level).toBe(LogLevels.ALL);
				expect(lastMsg.message).toBe(sampleMsg);

				spy.mockRestore();
			});

			it('should not send log to default group', () => {
				const id = '75984231';
				const sampleMsg = 'owl-monkey-badger-tree';
				const log = new Log();
				const spy = jest.spyOn(log.state.groups.default, 'log');

				log.logTo(id, LogLevels.ALL, sampleMsg);
				expect(spy).toHaveBeenCalledTimes(0);

				spy.mockRestore();
			});
		});

		describe('Log Level', () => {
			it('should execute transports when group and transport log level are active but global level is 0', () => {
				const activeInactive = jest.fn();
				const transportInactive = new LogTransport('inactive', LogLevels.NONE, activeInactive);
				const actionActive = jest.fn();
				const transportActive = new LogTransport('active', LogLevels.DEBUG, actionActive);
				log.setGlobalLevel(LogLevels.NONE);
				log.addTransport(transportInactive, '149719_7419');
				log.addTransport(transportInactive, '4741798_8811');

				const gid = '19GHVC_7149714_917477a6333AVH';
				log.addTransport(transportActive, gid);
				const group = log.getGroup(gid, true);
				group.setLogLevel(LogLevels.DEBUG);
			});
		});

		describe('Log Methods', () => {
			let logSpy: jest.SpyInstance;

			beforeAll(() => {
				logSpy = jest.spyOn(log, 'logTo');
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
						if (method.id === 'default') {
							log[method.name](MOCK_MSG);
						} else {
							log[method.name](method.id, MOCK_MSG);
						}

						expect(logSpy).toHaveBeenCalledTimes(1);
					});

					it(`should pass '${method.id}' id to log method`, () => {
						if (method.id === 'default') {
							log[method.name](MOCK_MSG);
						} else {
							log[method.name](method.id, MOCK_MSG);
						}

						expect(logSpy).toHaveBeenLastCalledWith(
							method.id,
							expect.anything(),
							expect.anything()
						);
						expect(logSpy).toHaveBeenCalledTimes(1);
					});

					it(`should pass log level '${method.level}' to log method`, () => {
						if (method.id === 'default') {
							log[method.name](MOCK_MSG);
						} else {
							log[method.name](method.id, MOCK_MSG);
						}

						expect(logSpy).toHaveBeenLastCalledWith(method.id, method.level, expect.anything());
						expect(logSpy).toHaveBeenCalledTimes(1);
					});

					it('should pass msg to log method', () => {
						const sampleMsg = 'AAA0814108';

						if (method.id === 'default') {
							log[method.name](sampleMsg);
						} else {
							log[method.name](method.id, sampleMsg);
						}

						expect(logSpy).toHaveBeenLastCalledWith(method.id, expect.anything(), sampleMsg);
						expect(logSpy).toHaveBeenCalledTimes(1);
					});
				});
			}
		});
	});
});
