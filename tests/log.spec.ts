import {Levels} from '../src/levels';
import {Log} from '../src/log';
import {Transport} from '../src/transport';

const MOCK_MSG = 'msg here';
const EMPTY_STRING = '';

const LOG_LEVELS: number[] = [
	Levels.ERROR,
	Levels.WARN,
	Levels.TRACE,
	Levels.INFO,
	Levels.DEBUG,
	Levels.TRACE
];

const LOG_METHODS = [
	{
		name: 'error',
		level: Levels.ERROR
	},
	{
		name: 'warn',
		level: Levels.WARN
	},
	{
		name: 'info',
		level: Levels.INFO
	},
	{
		name: 'debug',
		level: Levels.DEBUG
	},
	{
		name: 'trace',
		level: Levels.TRACE
	}
];

describe('Log', () => {
	const log = new Log({groupsStartEnabled: true});
	const ID = 'Test Transport';
	const ACTION = jest.fn(() => true);
	const TRANSPORT = new Transport({id: ID, level: Levels.ALL, action: ACTION});

	describe('Constructor', () => {
		it('should instantiate when no args are given', () => {
			expect(new Log()).toBeInstanceOf(Log);
		});

		it(`should class 'activateDefaultConsole' if 'consoleEnabled' is true`, () => {
			const spy = jest.spyOn(Log.prototype, 'activateDefaultConsole');
			expect(spy).not.toHaveBeenCalled();

			new Log({id: 'consoleEnabled', consoleEnabled: true});

			expect(spy).toHaveBeenCalled();
		});

		it(`should throw when 'state' is not a LogStateGlobal`, () => {
			expect(() => {
				new Log({id: '', state: {} as any});
			}).toThrow(`Bad Log init - 'state' was not an instance of LogStateGlobal.`);
		});
	});

	describe('Implementation', () => {
		describe(`DefaultConsole`, () => {
			describe(`activateDefaultConsole`, () => {
				it(`should create a transport with level arg`, () => {
					const level = 13;
					expect(level).not.toBe(log.globalState.globalLevel.get());
					expect(log.groupState.transports.size).toBe(0);

					log.activateDefaultConsole(level);

					expect(log.groupState.transports.size).toBe(1);
					expect(log.groupState.transports.values().next().value.level.get()).toBe(level);
					log.reset();
				});
			});

			describe(`deactiveDefaultConsole`, () => {
				it(`should remove transport with id 'console' from log`, () => {
					log.activateDefaultConsole();

					expect(log.getTransport('console')).not.toBeNull();

					log.deactivateDefaultConsole();

					expect(log.getTransport('console')).toBeNull();

					log.groupState.transports.clear();
				});
			});

			describe(`setLevelDefaultConsole`, () => {
				it(`should set the level of 'console'`, () => {
					const startingLevel = 5;
					const changedLevel = startingLevel * 2;

					log.activateDefaultConsole(startingLevel);

					log.setLevelDefaultConsole(changedLevel);

					const transport = log.getTransport('console');
					const result = transport?.level.get();

					expect(result).toBe(changedLevel);

					log.groupState.transports.clear();
				});
			});

			describe(`enableLevelDefaultConsole`, () => {
				it(`should add the level to 'console'`, () => {
					const startingLevel = 0b10101;
					const addedLevel = 0b00010;
					const totalLevel = startingLevel | addedLevel;

					log.activateDefaultConsole(startingLevel);

					log.enableLevelDefaultConsole(addedLevel);

					const transport = log.getTransport('console')!;
					const result = transport.level.get();

					expect(result).toBe(totalLevel);
					log.groupState.transports.clear();
				});
			});

			describe(`disableLevelDefaultConsole`, () => {
				it(`should remove the level from 'console'`, () => {
					const startingLevel = 0b10101;
					const removedLevel = 0b00100;
					const totalLevel = startingLevel ^ removedLevel;

					log.activateDefaultConsole(startingLevel);

					log.disableLevelDefaultConsole(removedLevel);

					const transport = log.getTransport('console')!;
					const result = transport.level.get();

					expect(result).toBe(totalLevel);
					log.groupState.transports.clear();
				});
			});
		});

		describe('makeLog', () => {
			it('should return null when id arg is an empty string', () => {
				expect(log.makeLog(EMPTY_STRING, {level: Levels.DEBUG})).toBeNull();
			});

			it('should return group when id already exists', () => {
				const id = '194714_8841978AF';
				const expected = log.makeLog(id, {level: Levels.DEBUG});

				const result = log.makeLog(id);

				expect(result).toBe(expected);
			});

			it('should return group when id is created', () => {
				const id = '491719714';
				expect(log.globalState.groups[id]).toBeUndefined();

				const result = log.makeLog(id, {level: Levels.DEBUG, enabled: false});

				expect(result).toBeInstanceOf(Log);

				const groupId = result.groupState.id;
				expect(log.globalState.groups.get(groupId)).toHaveProperty('groupState');
			});

			it(`should create transports if startingTransports were added`, () => {
				const baseLog = new Log({id: 'base log', startingTransports: [TRANSPORT]});
				const testLog = baseLog.makeLog('testLog');

				expect(testLog.groupState.transports.size).toBe(1);
			});
		});

		describe(`Transports`, () => {
			describe('addTransport', () => {
				it('should not add the same transport more than once', () => {
					log.addTransport(TRANSPORT);

					for (let i = 0; i < 5; i++) {
						expect(log.addTransport(TRANSPORT)).toBe(false);
					}

					for (let i = 0; i < 5; i++) {
						expect(log.addTransport({id: ID, level: Levels.ALL, action: ACTION})).toBe(false);
					}

					log.clear();
				});

				it('should return false and should not add a transport when transport arg is undefined', () => {
					expect(log.groupState.transports.size).toBe(0);

					expect(log.addTransport(undefined as any)).toBe(false);

					expect(log.groupState.transports.size).toBe(0);
				});

				it('should return false and should not add a transport when transport arg is null', () => {
					expect(log.groupState.transports.size).toBe(0);

					expect(log.addTransport(null as any)).toBe(false);

					expect(log.groupState.transports.size).toBe(0);
				});

				it(`should add transport to group`, () => {
					const transport = new Transport({id: '11097141', level: Levels.ALL, action: ACTION});
					expect(log.groupState.transports.size).toBe(0);

					log.addTransport(transport);

					expect(log.groupState.transports.size).toBe(1);
					log.clear();
				});
			});

			describe(`getTransport`, () => {
				it(`should return transport if one matching transportId exists`, () => {
					log.addTransport(TRANSPORT);

					const result = log.getTransport(TRANSPORT.id);

					expect(result).toBe(TRANSPORT);

					log.groupState.transports.clear();
				});

				it(`should return null if no matching transport exists`, () => {
					expect(log.groupState.transports.has(TRANSPORT)).toBe(false);

					const result = log.getTransport(TRANSPORT.id);

					expect(result).toBeNull();
				});
			});

			describe('removeTransport', () => {
				it('should return false when transport does not exist in group', () => {
					expect(log.removeTransport(TRANSPORT)).toBe(false);
				});

				it('should return false when transport arg is undefined', () => {
					expect(log.removeTransport(undefined as any)).toBe(false);
				});

				it('should remove transport group', () => {
					expect(log.groupState.transports.size).toBe(0);
					log.addTransport(TRANSPORT);
					expect(log.groupState.transports.size).toBe(1);
					log.removeTransport(TRANSPORT);
					expect(log.groupState.transports.size).toBe(0);
				});

				it('should return true when transport is removed', () => {
					expect(log.groupState.transports.size).toBe(0);
					log.addTransport(TRANSPORT);
					expect(log.groupState.transports.size).toBe(1);
					const result = log.removeTransport(TRANSPORT);
					expect(log.groupState.transports.size).toBe(0);
					expect(result).toBe(true);
				});
			});

			describe('removeTransportById', () => {
				it('should remove transport from group', () => {
					const transport = new Transport({id: 'id', level: Levels.ALL, action: ACTION});
					expect(log.groupState.transports.size).toBe(0);
					log.addTransport(transport);
					expect(log.groupState.transports.size).toBe(1);
					const result = log.removeTransportById('id');
					expect(log.groupState.transports.size).toBe(0);
					expect(result).toBeTruthy();
				});

				it('should return false if no transports are removed', () => {
					const transport = new Transport({id: 'id', level: Levels.ALL, action: ACTION});
					expect(log.groupState.transports.size).toBe(0);
					log.addTransport(transport);
					expect(log.groupState.transports.size).toBe(1);
					const result = log.removeTransportById('id2');
					expect(log.groupState.transports.size).toBe(1);
					expect(result).toBeFalsy();
				});
			});

			describe('removeTransports', () => {
				it('should return false when transports is not an array', () => {
					const result = log.removeTransports(null as any);

					expect(result).toBe(false);
				});

				it('should return false when no transports are removed', () => {
					const result = log.removeTransports([TRANSPORT]);

					expect(result).toBe(false);
				});

				it('should return true when a transport is removed', () => {
					log.clear();
					expect(log.groupState.transports.size).toBe(0);
					log.addTransport(TRANSPORT);
					expect(log.groupState.transports.size).toBe(1);

					const result = log.removeTransports([TRANSPORT]);

					expect(result).toBe(true);
					expect(log.groupState.transports.size).toBe(0);
				});
			});

			describe('removeTransportEverywhere', () => {
				it('should return false when transport is undefined', () => {
					expect(log.removeTransportEverywhere(undefined as any)).toBe(false);
				});

				it('should return false when transport is null', () => {
					expect(log.removeTransportEverywhere(null as any)).toBe(false);
				});

				it('should return false when transport arg is provided but is not a Transport', () => {
					expect(log.removeTransportEverywhere(141971 as any)).toBe(false);
				});

				it('should remove transport from all groups', () => {
					const group1 = log.makeLog('14971497_7d7AKHF');
					const group2 = log.makeLog('149719971_f7f7AA');
					const group3 = log.makeLog('778910891_KHF8M4');

					group1.addTransport(TRANSPORT);
					group2.addTransport(TRANSPORT);
					group3.addTransport(TRANSPORT);

					expect(group1.groupState.transports.size).toBe(1);
					expect(group2.groupState.transports.size).toBe(1);
					expect(group3.groupState.transports.size).toBe(1);

					log.removeTransportEverywhere(TRANSPORT);

					expect(group1.groupState.transports.size).toBe(0);
					expect(group2.groupState.transports.size).toBe(0);
					expect(group3.groupState.transports.size).toBe(0);
				});
			});
		});

		describe(`global levels`, () => {
			describe('setGlobalLevel', () => {
				it('should not change level when level arg is undefined', () => {
					const expected = log.globalState.globalLevel.get();

					log.setGlobalLevel('adfjakha' as any);

					expect(log.globalState.globalLevel.get()).toBe(expected);
				});

				it('should set global level to 0 when level arg is NONE', () => {
					expect(log.globalState.globalLevel.get()).not.toBe(Levels.NONE);

					log.setGlobalLevel(Levels.NONE);

					expect(log.globalState.globalLevel.get()).toBe(0);
				});

				for (const level of LOG_LEVELS) {
					it(`should set level to ${level}`, () => {
						expect(log.globalState.globalLevel.get()).not.toBe(level);
						log.setGlobalLevel(level);
						expect(log.globalState.globalLevel.get()).toBe(level);
					});
				}
			});

			it(`should call enableLogLevel`, () => {
				const spy = jest.spyOn(log.globalState.globalLevel, 'enableLevel');
				expect(spy).not.toBeCalled();

				log.enableGlobalLevel(1);

				expect(spy).toBeCalled();
			});

			it(`should call enableMultipleLevels`, () => {
				const spy = jest.spyOn(log.globalState.globalLevel, 'enableLevels');
				expect(spy).not.toBeCalled();

				log.enableGlobalLevels([1]);

				expect(spy).toBeCalled();
			});

			it(`should call disableLogLevel`, () => {
				const spy = jest.spyOn(log.globalState.globalLevel, 'disableLevel');
				expect(spy).not.toBeCalled();

				log.disableGlobalLevel(1);

				expect(spy).toBeCalled();
			});

			it(`should call disableMultipleLevels`, () => {
				const spy = jest.spyOn(log.globalState.globalLevel, 'disableLevels');
				expect(spy).not.toBeCalled();

				log.disableGlobalLevels([1]);

				expect(spy).toBeCalled();
			});
		});

		describe(`group levels`, () => {
			describe('setGroupLevel', () => {
				beforeEach(() => {
					log.setGroupLevel(Levels.ERROR);
				});

				it('should not change group level when level arg is undefined', () => {
					log.groupState.level.set(Levels.TRACE);
					log.setGroupLevel(undefined as any);
					expect(log.groupState.level.get()).toBe(Levels.TRACE);
				});

				for (const level of LOG_LEVELS) {
					it(`should set group level to ${level} set to ${level}`, () => {
						expect(log.groupState.level.get()).toBe(Levels.ERROR);
						log.setGroupLevel(level);
						expect(log.groupState.level.get()).toBe(level);
					});
				}
			});

			it(`should call enableLogLevel`, () => {
				const spy = jest.spyOn(log.groupState.level, 'enableLevel');
				expect(spy).not.toBeCalled();

				log.enableGroupLevel(1);

				expect(spy).toBeCalled();
			});

			it(`should call enableMultipleLevels`, () => {
				const spy = jest.spyOn(log.groupState.level, 'enableLevels');
				expect(spy).not.toBeCalled();

				log.enableGroupLevels([1]);

				expect(spy).toBeCalled();
			});

			it(`should call disableLogLevel`, () => {
				const spy = jest.spyOn(log.groupState.level, 'disableLevel');
				expect(spy).not.toBeCalled();

				log.disableGroupLevel(1);

				expect(spy).toBeCalled();
			});

			it(`should call disableMultipleLevels`, () => {
				const spy = jest.spyOn(log.groupState.level, 'disableLevels');
				expect(spy).not.toBeCalled();

				log.disableGroupLevels([1]);

				expect(spy).toBeCalled();
			});
		});

		describe('canExecute', () => {
			const LogLevel = 0b1010;
			const ceLog = log.makeLog('canExecute', {level: LogLevel});

			it('should return false when transport arg is undefined', () => {
				const result = ceLog['canExecute'](ceLog, undefined as any, Levels.ALL);

				expect(result).toBe(false);
			});

			it('should return false when transport arg is null', () => {
				const result = ceLog['canExecute'](ceLog, null as any, Levels.ALL);

				expect(result).toBe(false);
			});

			it('should return false when group is not enabled', () => {
				ceLog.groupState.enabled = false;

				const result = ceLog['canExecute'](ceLog, TRANSPORT.level.get(), Levels.ALL);
				ceLog.groupState.enabled = true;

				expect(result).toBe(false);
			});

			const BadMsgLevels: any[] = [-1, 0, 0.5, 5.7, '1'];
			it.each(BadMsgLevels)(`should return false: msgLevel '%p' not a positive integer`, (level) => {
				const result = ceLog['canExecute'](ceLog, TRANSPORT.level.get(), level);

				expect(result).toBe(false);
			});

			it('should return false when global and group levels have no active levels', () => {
				ceLog.setGlobalLevel(0);
				ceLog.setGroupLevel(0);

				const result = ceLog['canExecute'](ceLog, TRANSPORT.level.get(), Levels.ALL);

				expect(result).toBe(false);
			});

			it(`should return false when transport level does not match active levels`, () => {
				TRANSPORT.level.set(0b0001);
				expect(TRANSPORT.level.get() & ceLog.groupState.level.get()).toBe(0);

				const result = ceLog['canExecute'](ceLog, TRANSPORT.level.get(), Levels.ALL);
				TRANSPORT.level.set(Levels.ALL);

				expect(result).toBe(false);
			});

			it(`should return false when msgLevel does not match transport level`, () => {
				const msgLevel = Levels.ALL_CUSTOM;
				expect(TRANSPORT.level.get() & msgLevel).toBe(0);

				const result = ceLog['canExecute'](ceLog, TRANSPORT.level.get(), msgLevel);

				expect(result).toBe(false);
			});

			it(`should return true when global/group, transport, and message all share a level`, () => {
				ceLog.setGroupLevel(Levels.ALL);
				const msgLevel = Levels.WARN;
				expect(msgLevel & TRANSPORT.level.get() & ceLog.groupState.level.get()).toBeGreaterThan(0);

				const result = ceLog['canExecute'](ceLog, TRANSPORT.level.get(), msgLevel);

				expect(result).toBe(true);
			});
		});

		describe('log', () => {
			let executeSpy: jest.SpyInstance;

			beforeAll(() => {
				executeSpy = jest.spyOn(TRANSPORT, 'execute');
				log.addTransport(TRANSPORT);
			});

			beforeEach(() => {
				ACTION.mockClear();
				executeSpy.mockClear();
			});

			it('should not attempt to execute any transports when msg level is 0', async () => {
				expect(executeSpy).not.toHaveBeenCalled();

				await log.log(Levels.NONE, '11111111111');

				expect(executeSpy).not.toHaveBeenCalled();
			});

			it('should not attempt to execute any transports when log is not enabled', async () => {
				log.groupState.enabled = false;
				expect(executeSpy).not.toHaveBeenCalled();

				await log.log(Levels.ALL, '33333333333');
				log.groupState.enabled = true;

				expect(executeSpy).not.toHaveBeenCalled();
			});

			it('should only execute transports matching log level', async () => {
				expect(ACTION).not.toHaveBeenCalled();
				TRANSPORT.level.set(Levels.DEBUG);
				log.setGlobalLevel(Levels.NONE);
				log.setGroupLevel(Levels.WARN);
				const oppositeTransport = new Transport({id: 'opposite', level: Levels.WARN, action: ACTION});
				log.clear();
				log.addTransport(TRANSPORT);
				log.addTransport(oppositeTransport);

				await log.log(Levels.WARN, '5555555555');
				log.removeTransport(oppositeTransport);

				expect(ACTION).toHaveBeenCalledTimes(1);

				TRANSPORT.level.set(Levels.ALL);
			});

			it(`should not throw when transport throws`, (done) => {
				log.enableGroupLevel(1);
				const transport = new Transport({
					id: 'SyncAction',
					level: 1,
					action: () => {
						throw Error('Sync Err');
					}
				});
				const transportAsync = new Transport({
					id: 'AsyncAction',
					level: 1,
					action: async () => {
						throw Error('Async Err');
					}
				});

				log.addTransport(transportAsync);
				log.addTransport(transport);

				log.log(1, 'throw')
					.catch((err) => {
						fail(err);
					})
					.finally(() => {
						log.clearAll();
						done();
					});
			});

			it(`should return list of failures when transports return false`, (done) => {
				log.enableGroupLevel(1);
				log.clearAll();
				const transport = new Transport({
					id: 'SyncAction',
					level: 1,
					action: () => {
						return false;
					}
				});
				const transportAsync = new Transport({
					id: 'AsyncAction',
					level: 1,
					action: async () => {
						throw 'err';
					}
				});

				log.addTransport(transportAsync);
				log.addTransport(transport);

				log.log(1, 'fails')
					.then((res) => {
						const expected = {
							SyncAction: false,
							AsyncAction: 'err'
						};
						expect(res).toEqual(expect.objectContaining(expected));
					})
					.catch((err) => {
						fail(err);
					})
					.finally(() => {
						log.clearAll();
						done();
					});
			});

			it(`should return true when transports return true`, (done) => {
				log.enableGroupLevel(1);
				log.clearAll();
				const transport = new Transport({
					id: 'SyncAction',
					level: 1,
					action: () => {
						return true;
					}
				});
				const transportAsync = new Transport({
					id: 'AsyncAction',
					level: 1,
					action: async () => {
						return true;
					}
				});

				log.addTransport(transportAsync);
				log.addTransport(transport);

				log.log(1, 'works')
					.then((res) => {
						expect(res).toBe(true);
					})
					.catch((err) => {
						fail(err);
					})
					.finally(() => {
						log.clearAll();
						done();
					});
			});

			it(`should call parent tranports`, async () => {
				log.clearAll();
				log.addTransport(TRANSPORT);
				const childLog = log.makeLog('child', {enabled: true, level: Levels.ALL});
				expect(ACTION).not.toHaveBeenCalled();

				await childLog.error('msg');

				expect(ACTION).toHaveBeenCalled();
			});

			it(`should not call parent tranports if child has transport with the same id`, async () => {
				log.clearAll();
				log.addTransport(TRANSPORT);
				const childLog = log.makeLog('child', {enabled: true, level: Levels.ALL});
				childLog.addTransport(TRANSPORT);
				expect(ACTION).not.toHaveBeenCalled();

				await childLog.error('msg');

				expect(ACTION).toHaveBeenCalledTimes(1);
			});
		});

		describe('Log Methods', () => {
			const logSpy = jest.spyOn(log, 'log');

			beforeEach(() => {
				logSpy.mockClear();
				expect(logSpy).not.toHaveBeenCalled();
			});

			afterAll(() => {
				logSpy.mockRestore();
			});

			for (const method of LOG_METHODS) {
				describe(`${method.name}`, () => {
					it('should call log method exactly once', () => {
						log[method.name](MOCK_MSG);

						expect(logSpy).toHaveBeenCalledTimes(1);
					});

					it(`should pass level '${method.level}' to log method`, () => {
						log[method.name](MOCK_MSG);

						expect(logSpy).toHaveBeenLastCalledWith(method.level, expect.anything());
						expect(logSpy).toHaveBeenCalledTimes(1);
					});

					it('should pass msg to log method', () => {
						const sampleMsg = 'AAA0814108';

						log[method.name](sampleMsg);

						expect(logSpy).toHaveBeenLastCalledWith(expect.anything(), sampleMsg);
						expect(logSpy).toHaveBeenCalledTimes(1);
					});
				});
			}
		});
	});
});
