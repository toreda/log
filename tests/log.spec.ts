import {Log} from '../src/log';
import {Levels} from '../src/levels';
import {Transport} from '../src/transport';

const MOCK_TRANSPORT_ID = '149714971_92872981';
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
	const action = jest.fn(() => true);
	const transport = new Transport(MOCK_TRANSPORT_ID, Levels.ALL, action);

	describe('Constructor', () => {
		it('should instantiate when no args are given', () => {
			expect(new Log()).toBeInstanceOf(Log);
		});
	});

	describe('Implementation', () => {
		describe(`activateDefaultConsole`, () => {
			it(`should create a transport with level arg`, () => {
				const level = 13;
				expect(level).not.toBe(log.globalState.globalLevel());
				expect(log.groupState.transports.size).toBe(0);

				log.activateDefaultConsole(level);

				expect(log.groupState.transports.size).toBe(1);
				expect(log.groupState.transports.values().next().value.level()).toBe(level);
				log.reset();
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

				const result = log.makeLog(id, {level: Levels.DEBUG});

				expect(result).toBeInstanceOf(Log);
				expect(log.globalState.groups.get(id)).toHaveProperty('group');
			});
		});

		describe('addTransport', () => {
			it('should not add the same transport more than once', () => {
				log.addTransport(transport);

				for (let i = 0; i < 5; i++) {
					expect(log.addTransport(transport)).toBe(false);
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
				const transport = new Transport('11097141', Levels.ALL, action);
				expect(log.groupState.transports.size).toBe(0);

				log.addTransport(transport);

				expect(log.groupState.transports.size).toBe(1);
				log.clear();
			});
		});

		describe('removeTransport', () => {
			it('should return false when transport does not exist in group', () => {
				expect(log.removeTransport(transport)).toBe(false);
			});

			it('should return false when transport arg is undefined', () => {
				expect(log.removeTransport(undefined as any)).toBe(false);
			});

			it('should remove transport group', () => {
				expect(log.groupState.transports.size).toBe(0);
				log.addTransport(transport);
				expect(log.groupState.transports.size).toBe(1);
				log.removeTransport(transport);
				expect(log.groupState.transports.size).toBe(0);
			});

			it('should return true when transport is removed', () => {
				expect(log.groupState.transports.size).toBe(0);
				log.addTransport(transport);
				expect(log.groupState.transports.size).toBe(1);
				const result = log.removeTransport(transport);
				expect(log.groupState.transports.size).toBe(0);
				expect(result).toBe(true);
			});
		});

		describe('removeTransportById', () => {
			it('should remove transport from group', () => {
				const transport = new Transport('id', Levels.ALL, action);
				expect(log.groupState.transports.size).toBe(0);
				log.addTransport(transport);
				expect(log.groupState.transports.size).toBe(1);
				const result = log.removeTransportById('id');
				expect(log.groupState.transports.size).toBe(0);
				expect(result).toBeTruthy();
			});

			it('should return false if no transports are removed', () => {
				const transport = new Transport('id', Levels.ALL, action);
				expect(log.groupState.transports.size).toBe(0);
				log.addTransport(transport);
				expect(log.groupState.transports.size).toBe(1);
				const result = log.removeTransportById('id2');
				expect(log.groupState.transports.size).toBe(1);
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

			it('should return false when transport arg is provided but is not a Transport', () => {
				expect(log.removeTransportEverywhere(141971 as any)).toBe(false);
			});

			it('should remove transport from all groups', () => {
				const group1 = log.makeLog('14971497_7d7AKHF');
				const group2 = log.makeLog('149719971_f7f7AA');
				const group3 = log.makeLog('778910891_KHF8M4');

				group1.addTransport(transport);
				group2.addTransport(transport);
				group3.addTransport(transport);

				expect(group1.groupState.transports.size).toBe(1);
				expect(group2.groupState.transports.size).toBe(1);
				expect(group3.groupState.transports.size).toBe(1);

				log.removeTransportEverywhere(transport);

				expect(group1.groupState.transports.size).toBe(0);
				expect(group2.groupState.transports.size).toBe(0);
				expect(group3.groupState.transports.size).toBe(0);
			});
		});

		describe(`global levels`, () => {
			describe('setGlobalLevel', () => {
				it('should not change level when level arg is undefined', () => {
					const expected = log.globalState.globalLevel();

					log.setGlobalLevel('adfjakha' as any);

					expect(log.globalState.globalLevel()).toBe(expected);
				});

				it('should set global level to 0 when level arg is NONE', () => {
					expect(log.globalState.globalLevel()).not.toBe(Levels.NONE);

					log.setGlobalLevel(Levels.NONE);

					expect(log.globalState.globalLevel()).toBe(0);
				});

				for (const level of LOG_LEVELS) {
					it(`should set level to ${level}`, () => {
						expect(log.globalState.globalLevel()).not.toBe(level);
						log.setGlobalLevel(level);
						expect(log.globalState.globalLevel()).toBe(level);
					});
				}
			});

			it(`should call enableLogLevel`, () => {
				const spy = jest.spyOn(log.globalState.globalLevel, 'enableLogLevel');
				expect(spy).not.toBeCalled();

				log.enableGlobalLevel(1);

				expect(spy).toBeCalled();
			});

			it(`should call enableMultipleLevels`, () => {
				const spy = jest.spyOn(log.globalState.globalLevel, 'enableMultipleLevels');
				expect(spy).not.toBeCalled();

				log.enableGlobalLevels([1]);

				expect(spy).toBeCalled();
			});

			it(`should call disableLogLevel`, () => {
				const spy = jest.spyOn(log.globalState.globalLevel, 'disableLogLevel');
				expect(spy).not.toBeCalled();

				log.disableGlobalLevel(1);

				expect(spy).toBeCalled();
			});

			it(`should call disableMultipleLevels`, () => {
				const spy = jest.spyOn(log.globalState.globalLevel, 'disableMultipleLevels');
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
					log.groupState.level(Levels.TRACE);
					log.setGroupLevel(undefined as any);
					expect(log.groupState.level()).toBe(Levels.TRACE);
				});

				for (const level of LOG_LEVELS) {
					it(`should set group level to ${level} set to ${level}`, () => {
						expect(log.groupState.level()).toBe(Levels.ERROR);
						log.setGroupLevel(level);
						expect(log.groupState.level()).toBe(level);
					});
				}
			});

			it(`should call enableLogLevel`, () => {
				const spy = jest.spyOn(log.groupState.level, 'enableLogLevel');
				expect(spy).not.toBeCalled();

				log.enableGroupLevel(1);

				expect(spy).toBeCalled();
			});

			it(`should call enableMultipleLevels`, () => {
				const spy = jest.spyOn(log.groupState.level, 'enableMultipleLevels');
				expect(spy).not.toBeCalled();

				log.enableGroupLevels([1]);

				expect(spy).toBeCalled();
			});

			it(`should call disableLogLevel`, () => {
				const spy = jest.spyOn(log.groupState.level, 'disableLogLevel');
				expect(spy).not.toBeCalled();

				log.disableGroupLevel(1);

				expect(spy).toBeCalled();
			});

			it(`should call disableMultipleLevels`, () => {
				const spy = jest.spyOn(log.groupState.level, 'disableMultipleLevels');
				expect(spy).not.toBeCalled();

				log.disableGroupLevels([1]);

				expect(spy).toBeCalled();
			});
		});

		describe(`createMessage`, () => {
			const level = 1;

			it(`should return with a string message if msg.length > 1`, () => {
				const result = log['createMessage'](level, ['def'], 1, 2, 3, 4);

				expect(typeof result.message).toBe('string');
			});

			it(`should return with a string message if msg.length === 0`, () => {
				const result = log['createMessage'](level, ['def']);

				expect(typeof result.message).toBe('string');
			});

			it(`should return with a string message if msg is a single string`, () => {
				const result = log['createMessage'](level, ['def'], 'single string message');

				expect(typeof result.message).toBe('string');
			});

			it(`should return with a string message if msg is a single non string`, () => {
				const result = log['createMessage'](level, ['def'], {a: 'b'});

				expect(typeof result.message).toBe('string');
			});
		});

		describe('canExecute', () => {
			const LogLevel = 0b1010;
			const ceLog = log.makeLog('canExecute', {level: LogLevel});

			it('should return false when transport arg is undefined', () => {
				const result = ceLog['canExecute'](undefined as any, Levels.ALL);

				expect(result).toBe(false);
			});

			it('should return false when transport arg is null', () => {
				const result = ceLog['canExecute'](null as any, Levels.ALL);

				expect(result).toBe(false);
			});

			it('should return false when transport arg is not a Transport', () => {
				const result = ceLog['canExecute'](ceLog as any, Levels.ALL);

				expect(result).toBe(false);
			});

			it('should return false when group is not enabled', () => {
				ceLog.groupState.enabled(false);

				const result = ceLog['canExecute'](transport.level(), Levels.ALL);
				ceLog.groupState.enabled(true);

				expect(result).toBe(false);
			});

			const BadMsgLevels: any[] = [-1, 0, 0.5, 5.7, '1'];
			it.each(BadMsgLevels)(`should return false: msgLevel '%p' not a positive integer`, (level) => {
				const result = ceLog['canExecute'](transport.level(), level);

				expect(result).toBe(false);
			});

			it('should return false when global and group levels have no active levels', () => {
				ceLog.setGlobalLevel(0);
				ceLog.setGroupLevel(0);

				const result = ceLog['canExecute'](transport.level(), Levels.ALL);

				expect(result).toBe(false);
			});

			it(`should return false when transport level does not match active levels`, () => {
				transport.level(0b0001);
				expect(transport.level() & ceLog.groupState.level()).toBe(0);

				const result = ceLog['canExecute'](transport.level(), Levels.ALL);
				transport.level(Levels.ALL);

				expect(result).toBe(false);
			});

			it(`should return false when msgLevel does not match transport level`, () => {
				const msgLevel = Levels.ALL_CUSTOM;
				expect(transport.level() & msgLevel).toBe(0);

				const result = ceLog['canExecute'](transport.level(), msgLevel);

				expect(result).toBe(false);
			});

			it(`should return true when global/group, transport, and message all share a level`, () => {
				ceLog.setGroupLevel(Levels.ALL);
				const msgLevel = Levels.WARN;
				expect(msgLevel & transport.level() & ceLog.groupState.level()).toBeGreaterThan(0);

				const result = ceLog['canExecute'](transport.level(), msgLevel);

				expect(result).toBe(true);
			});
		});

		describe('log', () => {
			let executeSpy: jest.SpyInstance;

			beforeAll(() => {
				executeSpy = jest.spyOn(transport, 'execute');
				log.addTransport(transport);
			});

			beforeEach(() => {
				action.mockClear();
				executeSpy.mockClear();
			});

			it('should not attempt to execute any transports when msg level is 0', async () => {
				expect(executeSpy).not.toHaveBeenCalled();

				await log.log(Levels.NONE, '11111111111');

				expect(executeSpy).not.toHaveBeenCalled();
			});

			it('should not attempt to execute any transports when log is not enabled', async () => {
				log.groupState.enabled(false);
				expect(executeSpy).not.toHaveBeenCalled();

				await log.log(Levels.ALL, '33333333333');
				log.groupState.enabled(true);

				expect(executeSpy).not.toHaveBeenCalled();
			});

			it('should only execute transports matching log level', async () => {
				expect(action).not.toHaveBeenCalled();
				transport.level(Levels.DEBUG);
				log.setGlobalLevel(Levels.NONE);
				log.setGroupLevel(Levels.WARN);
				const oppositeTransport = new Transport('opposite', Levels.WARN, action);
				log.clear();
				log.addTransport(transport);
				log.addTransport(oppositeTransport);

				await log.log(Levels.WARN, '5555555555');
				log.removeTransport(oppositeTransport);

				expect(action).toHaveBeenCalledTimes(1);
			});

			it(`should not throw when transport throws`, (done) => {
				log.enableGroupLevel(1);
				const transport = new Transport('SyncAction', 1, () => {
					throw Error('Sync Err');
				});
				const transportAsync = new Transport('AsyncAction', 1, async () => {
					throw Error('Async Err');
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
				const transport = new Transport('SyncAction', 1, () => {
					return false;
				});
				const transportAsync = new Transport('AsyncAction', 1, async () => {
					throw 'err';
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

			it(`should return list of failure when transports return false`, (done) => {
				log.enableGroupLevel(1);
				const transport = new Transport('SyncAction', 1, () => {
					return true;
				});
				const transportAsync = new Transport('AsyncAction', 1, async () => {
					return true;
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
