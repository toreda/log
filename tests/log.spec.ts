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

		it('should register root group under its own group id', () => {
			const root = new Log();
			expect(root.globalState.groups.get(root.groupState.id)).toBe(root);

			const named = new Log({id: 'named'});
			expect(named.globalState.groups.get('named')).toBe(named);
		});

		it('should create startingGroups', () => {
			const root = new Log({
				startingGroups: [{id: 'alpha'}, {id: 'beta', level: Levels.DEBUG, enabled: false}]
			});

			const alpha = root.globalState.groups.get('alpha');
			const beta = root.globalState.groups.get('beta');

			expect(alpha).toBeInstanceOf(Log);
			expect(alpha?.groupState.parent).toBe(root);
			expect(beta?.groupState.level.get()).toBe(Levels.DEBUG);
			expect(beta?.groupState.enabled).toBe(false);
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
					expect(log.groupState.transports.values().next().value?.level.get()).toBe(level);
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

			describe(`level keys`, () => {
				beforeEach(() => {
					log.deactivateDefaultConsole();
				});

				afterAll(() => {
					log.deactivateDefaultConsole();
				});

				it(`should activate console with a level key`, () => {
					log.activateDefaultConsole('error');

					expect(log.getTransport('console')?.level.get()).toBe(Levels.ERROR);
				});

				it(`should set console level from an array of level keys`, () => {
					log.activateDefaultConsole(Levels.ALL);
					log.setLevelDefaultConsole(['error', 'warn']);

					expect(log.getTransport('console')?.level.get()).toBe(Levels.ERROR | Levels.WARN);
				});

				it(`should enable a level key on console`, () => {
					log.activateDefaultConsole(Levels.ERROR);
					log.enableLevelDefaultConsole('trace');

					expect(log.getTransport('console')?.level.get()).toBe(Levels.ERROR | Levels.TRACE);
				});

				it(`should disable each level key in an array on console`, () => {
					log.activateDefaultConsole(Levels.ALL);
					log.disableLevelDefaultConsole(['debug', 'trace']);

					expect(log.getTransport('console')?.level.get()).toBe(
						Levels.ALL & ~Levels.DEBUG & ~Levels.TRACE
					);
				});
			});
		});

		describe('make', () => {
			it('should return null when id arg is an empty string', () => {
				expect(log.make(EMPTY_STRING, {level: Levels.DEBUG})).toBeNull();
			});

			it('should return null when id arg is only whitespace', () => {
				expect(log.make('   ')).toBeNull();
			});

			it('should return null when id arg has an empty segment', () => {
				expect(log.make('a..b')).toBeNull();
				expect(log.make('.a')).toBeNull();
				expect(log.make('a.')).toBeNull();
			});

			it(`should create a child named 'default' instead of returning the root`, () => {
				const root = new Log();
				const child = root.make('default');

				expect(child).not.toBe(root);
				expect(child.groupState.parent).toBe(root);
			});

			it('should return group when id already exists', () => {
				const id = '194714_8841978AF';
				const expected = log.make(id, {level: Levels.DEBUG});

				const result = log.make(id);

				expect(result).toBe(expected);
			});

			it('should return group when id is created', () => {
				const id = '491719714';
				expect(log.globalState.groups[id]).toBeUndefined();

				const result = log.make(id, {level: Levels.DEBUG, enabled: false});

				expect(result).toBeInstanceOf(Log);

				const groupId = result.groupState.id;
				expect(log.globalState.groups.get(groupId)).toHaveProperty('groupState');
			});

			it(`should create transports if startingTransports were added`, () => {
				const baseLog = new Log({id: 'base log', startingTransports: [TRANSPORT]});
				const testLog = baseLog.make('testLog');

				expect(testLog.groupState.transports.size).toBe(1);
			});

			it(`should create group with level from a level key`, () => {
				const result = log.make('keyed-level', {level: 'trace'});

				expect(result.groupState.level.get()).toBe(Levels.TRACE);
			});

			it(`should create group with level from an array of level keys`, () => {
				const result = log.make('keyed-levels', {level: ['error', 'debug']});

				expect(result.groupState.level.get()).toBe(Levels.ERROR | Levels.DEBUG);
			});

			it(`should fall back to global level when level key is unknown`, () => {
				const result = log.make('keyed-bad', {level: 'fatal' as any});

				expect(result.groupState.level.get()).toBe(log.globalState.globalLevel.get());
			});

			describe('caching', () => {
				it('should create exactly one group for repeated calls with the same id', () => {
					const root = new Log({id: 'root'});
					const startingCount = root.globalState.groups.size;

					const first = root.make('cached');
					const second = root.make('cached');
					const third = root.make('cached', {level: Levels.TRACE, enabled: false});

					expect(second).toBe(first);
					expect(third).toBe(first);
					expect(root.globalState.groups.size).toBe(startingCount + 1);
				});

				it('should not change options of an existing group on repeated calls', () => {
					const root = new Log({id: 'root'});
					const first = root.make('cached', {level: Levels.DEBUG, enabled: true});

					root.make('cached', {level: Levels.TRACE, enabled: false});

					expect(first.groupState.level.get()).toBe(Levels.DEBUG);
					expect(first.groupState.enabled).toBe(true);
				});

				it('should return the same instance whether called from the parent or via a dotted id', () => {
					const root = new Log({id: 'root'});
					const viaChain = root.make('a').make('b');
					const viaDotted = root.make('a.b');

					expect(viaDotted).toBe(viaChain);
					expect(root.globalState.groups.size).toBe(3);
				});

				it('should return the same instance from any log sharing the same global state', () => {
					const root = new Log({id: 'root'});
					const a = root.make('a');
					const b = a.make('b');

					expect(root.make('a.b')).toBe(b);
					expect(root.make('a')).toBe(a);
					expect(a.make('b')).toBe(b);
				});
			});

			describe('hierarchy', () => {
				it('should build the group id from the full path of parents', () => {
					const root = new Log({id: 'root'});
					const a = root.make('a');
					const b = a.make('b');

					expect(a.groupState.id).toBe('root.a');
					expect(b.groupState.id).toBe('root.a.b');
					expect(b.groupState.path).toEqual(['root', 'a', 'b']);
					expect(b.groupState.parent).toBe(a);
					expect(a.groupState.parent).toBe(root);
				});

				it('should create different logs for the same id at different hierarchy locations', () => {
					const root = new Log({id: 'root'});
					const a = root.make('a');

					const rootB = root.make('b');
					const aB = a.make('b');

					expect(aB).not.toBe(rootB);
					expect(rootB.groupState.id).toBe('root.b');
					expect(aB.groupState.id).toBe('root.a.b');
					expect(rootB.groupState.parent).toBe(root);
					expect(aB.groupState.parent).toBe(a);
				});

				it('should never map two hierarchy locations to one instance', () => {
					const root = new Log({id: 'root'});
					const ids = ['x', 'x.y', 'x.y.z', 'y', 'y.z', 'z'];
					const seen = new Map<Log, string>();

					for (const id of ids) {
						const group = root.make(id);
						expect(seen.has(group)).toBe(false);
						seen.set(group, id);
						expect(group.groupState.id).toBe(`root.${id}`);
					}
				});

				it('should give a dotted id the same parent chain as nested make calls', () => {
					const root = new Log({id: 'root'});
					const b = root.make('a.b');
					const a = root.make('a');

					expect(b.groupState.parent).toBe(a);
					expect(a.groupState.parent).toBe(root);
					expect(b.groupState.path).toEqual(['root', 'a', 'b']);
				});

				it('should only apply options to the final segment of a dotted id', () => {
					const root = new Log({id: 'root'});
					const b = root.make('a.b', {level: Levels.TRACE, enabled: false});
					const a = root.make('a');

					expect(b.groupState.level.get()).toBe(Levels.TRACE);
					expect(b.groupState.enabled).toBe(false);
					expect(a.groupState.level.get()).toBe(root.globalState.globalLevel.get());
					expect(a.groupState.enabled).toBe(root.globalState.groupsStartEnabled);
				});

				it('should keep a dotted root id as a single path segment', () => {
					const root = new Log({id: 'my.root'});
					const child = root.make('child');

					expect(root.groupState.path).toEqual(['my.root']);
					expect(child.groupState.path).toEqual(['my.root', 'child']);
					expect(child.groupState.id).toBe('my.root.child');
					expect(child.groupState.parent).toBe(root);
				});

				it('should build child ids without a leading separator when the root has no id', () => {
					const root = new Log();
					const child = root.make('child');

					expect(child.groupState.id).toBe('child');
					expect(child.groupState.path).toEqual(['child']);
				});

				it('should create startingGroups as children of the root', () => {
					const root = new Log({
						id: 'root',
						startingGroups: [{id: 'a'}, {id: 'a.b', level: Levels.TRACE}]
					});

					const a = root.make('a');
					const b = root.make('a.b');

					expect(root.globalState.groups.size).toBe(3);
					expect(a.groupState.parent).toBe(root);
					expect(b.groupState.parent).toBe(a);
					expect(b.groupState.level.get()).toBe(Levels.TRACE);
				});
			});
		});

		describe('makeLog', () => {
			it('should be an alias of make that returns the same instance', () => {
				const root = new Log({id: 'root'});
				const viaMake = root.make('alias', {level: Levels.DEBUG});

				expect(root.makeLog('alias')).toBe(viaMake);
				expect(root.makeLog('alias.child')).toBe(root.make('alias.child'));
				expect(root.makeLog(EMPTY_STRING)).toBeNull();
			});

			it('should delegate to make and never create a second group', () => {
				const root = new Log({id: 'root'});
				const spy = jest.spyOn(root, 'make');

				const first = root.makeLog('spied', {enabled: false});
				const second = root.makeLog('spied');

				expect(spy).toHaveBeenCalledTimes(2);
				expect(second).toBe(first);
				expect(root.globalState.groups.size).toBe(2);
				spy.mockRestore();
			});
		});

		describe('reset', () => {
			it('should remove all groups except the initial group and return it', () => {
				const root = new Log();
				root.addTransport(TRANSPORT);
				root.make('one');
				root.make('two');
				expect(root.globalState.groups.size).toBe(3);

				const result = root.reset();

				expect(result).toBe(root);
				expect(root.globalState.groups.size).toBe(1);
				expect(root.groupState.transports.size).toBe(0);
			});
		});

		describe(`Transports`, () => {
			describe('addTransport', () => {
				it('should not add the same transport more than once', () => {
					log.addTransport(TRANSPORT);

					for (let i = 0; i < 5; i++) {
						expect(log.addTransport(TRANSPORT)).toEqual({
							ok: false,
							errorCode: 'transport_duplicate'
						});
					}

					for (let i = 0; i < 5; i++) {
						expect(log.addTransport({id: ID, level: Levels.ALL, action: ACTION})).toEqual({
							ok: false,
							errorCode: 'transport_duplicate'
						});
					}

					log.clear();
				});

				it('should return transport_missing and should not add a transport when transport arg is undefined', () => {
					expect(log.groupState.transports.size).toBe(0);

					expect(log.addTransport(undefined as any)).toEqual({
						ok: false,
						errorCode: 'transport_missing'
					});

					expect(log.groupState.transports.size).toBe(0);
				});

				it('should return transport_missing and should not add a transport when transport arg is null', () => {
					expect(log.groupState.transports.size).toBe(0);

					expect(log.addTransport(null as any)).toEqual({
						ok: false,
						errorCode: 'transport_missing'
					});

					expect(log.groupState.transports.size).toBe(0);
				});

				it('should return ok when transport is added', () => {
					expect(log.addTransport(TRANSPORT)).toEqual({ok: true, errorCode: null});
					expect(log.groupState.transports.has(TRANSPORT)).toBe(true);
					log.clear();
				});

				it('should return transport_init_failed with the thrown error when transport args are invalid', () => {
					expect(log.groupState.transports.size).toBe(0);

					const result = log.addTransport({id: ID, level: -1, action: ACTION});

					expect(result.ok).toBe(false);
					expect(result.errorCode).toBe('transport_init_failed');
					expect(result.errors).toHaveLength(1);
					expect(result.errors?.[0]).toBeInstanceOf(Error);
					expect((result.errors?.[0] as Error).message).toBe(
						`[logtr:${ID}] Init failure - level arg must be a valid log level.`
					);
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
					const group1 = log.make('14971497_7d7AKHF');
					const group2 = log.make('149719971_f7f7AA');
					const group3 = log.make('778910891_KHF8M4');

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
				expect(spy).not.toHaveBeenCalled();

				log.enableGlobalLevel(1);

				expect(spy).toHaveBeenCalled();
			});

			it(`should call enableMultipleLevels`, () => {
				const spy = jest.spyOn(log.globalState.globalLevel, 'enableLevels');
				expect(spy).not.toHaveBeenCalled();

				log.enableGlobalLevels([1]);

				expect(spy).toHaveBeenCalled();
			});

			it(`should call disableLogLevel`, () => {
				const spy = jest.spyOn(log.globalState.globalLevel, 'disableLevel');
				expect(spy).not.toHaveBeenCalled();

				log.disableGlobalLevel(1);

				expect(spy).toHaveBeenCalled();
			});

			it(`should call disableMultipleLevels`, () => {
				const spy = jest.spyOn(log.globalState.globalLevel, 'disableLevels');
				expect(spy).not.toHaveBeenCalled();

				log.disableGlobalLevels([1]);

				expect(spy).toHaveBeenCalled();
			});

			describe('level keys', () => {
				let initialLevel: number;

				beforeAll(() => {
					initialLevel = log.globalState.globalLevel.get();
				});

				afterAll(() => {
					log.setGlobalLevel(initialLevel);
				});

				it('should set global level from a level key', () => {
					log.setGlobalLevel('debug');

					expect(log.globalState.globalLevel.get()).toBe(Levels.DEBUG);
				});

				it('should combine an array of level keys into the global level', () => {
					log.setGlobalLevel(['error', 'warn']);

					expect(log.globalState.globalLevel.get()).toBe(Levels.ERROR | Levels.WARN);
				});

				it('should not change global level when level key is unknown', () => {
					log.setGlobalLevel(Levels.INFO);
					log.setGlobalLevel('fatal' as any);

					expect(log.globalState.globalLevel.get()).toBe(Levels.INFO);
				});

				it('should enable a level key without changing other flags', () => {
					log.setGlobalLevel(Levels.ERROR);
					log.enableGlobalLevel('trace');

					expect(log.globalState.globalLevel.get()).toBe(Levels.ERROR | Levels.TRACE);
				});

				it('should enable each level key in an array', () => {
					log.setGlobalLevel(Levels.NONE);
					log.enableGlobalLevel(['debug', Levels.INFO]);

					expect(log.globalState.globalLevel.get()).toBe(Levels.DEBUG | Levels.INFO);
				});

				it('should disable a level key without changing other flags', () => {
					log.setGlobalLevel(Levels.ALL);
					log.disableGlobalLevel('debug');

					expect(log.globalState.globalLevel.get()).toBe(Levels.ALL & ~Levels.DEBUG);
				});

				it('should disable each level key in an array', () => {
					log.setGlobalLevel(Levels.ALL);
					log.disableGlobalLevels(['debug', 'trace']);

					expect(log.globalState.globalLevel.get()).toBe(
						Levels.ALL & ~Levels.DEBUG & ~Levels.TRACE
					);
				});
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
				expect(spy).not.toHaveBeenCalled();

				log.enableGroupLevel(1);

				expect(spy).toHaveBeenCalled();
			});

			it(`should call enableMultipleLevels`, () => {
				const spy = jest.spyOn(log.groupState.level, 'enableLevels');
				expect(spy).not.toHaveBeenCalled();

				log.enableGroupLevels([1]);

				expect(spy).toHaveBeenCalled();
			});

			it(`should call disableLogLevel`, () => {
				const spy = jest.spyOn(log.groupState.level, 'disableLevel');
				expect(spy).not.toHaveBeenCalled();

				log.disableGroupLevel(1);

				expect(spy).toHaveBeenCalled();
			});

			it(`should call disableMultipleLevels`, () => {
				const spy = jest.spyOn(log.groupState.level, 'disableLevels');
				expect(spy).not.toHaveBeenCalled();

				log.disableGroupLevels([1]);

				expect(spy).toHaveBeenCalled();
			});

			describe('level keys', () => {
				let initialLevel: number;

				beforeAll(() => {
					initialLevel = log.groupState.level.get();
				});

				afterAll(() => {
					log.setGroupLevel(initialLevel);
				});

				it('should set group level from a level key', () => {
					log.setGroupLevel('debug');

					expect(log.groupState.level.get()).toBe(Levels.DEBUG);
				});

				it('should combine an array of level keys into the group level', () => {
					log.setGroupLevel(['error', 'warn']);

					expect(log.groupState.level.get()).toBe(Levels.ERROR | Levels.WARN);
				});

				it('should not change group level when level key is unknown', () => {
					log.setGroupLevel(Levels.INFO);
					log.setGroupLevel('fatal' as any);

					expect(log.groupState.level.get()).toBe(Levels.INFO);
				});

				it('should enable a level key without changing other flags', () => {
					log.setGroupLevel(Levels.ERROR);
					log.enableGroupLevel('trace');

					expect(log.groupState.level.get()).toBe(Levels.ERROR | Levels.TRACE);
				});

				it('should enable each level key in an array', () => {
					log.setGroupLevel(Levels.NONE);
					log.enableGroupLevels(['debug', Levels.INFO]);

					expect(log.groupState.level.get()).toBe(Levels.DEBUG | Levels.INFO);
				});

				it('should disable a level key without changing other flags', () => {
					log.setGroupLevel(Levels.ALL);
					log.disableGroupLevel('debug');

					expect(log.groupState.level.get()).toBe(Levels.ALL & ~Levels.DEBUG);
				});

				it('should disable each level key in an array', () => {
					log.setGroupLevel(Levels.ALL);
					log.disableGroupLevel(['debug', 'trace']);

					expect(log.groupState.level.get()).toBe(Levels.ALL & ~Levels.DEBUG & ~Levels.TRACE);
				});
			});
		});

		describe('canExecute', () => {
			const LogLevel = 0b1010;
			const ceLog = log.make('canExecute', {level: LogLevel});

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

			it('should resolve a level key to the message level', async () => {
				TRANSPORT.level.set(Levels.ALL);
				log.setGlobalLevel(Levels.ALL);
				log.clear();
				log.addTransport(TRANSPORT);

				await log.log('warn', 'level key msg');
				log.setGlobalLevel(Levels.NONE);

				expect(executeSpy).toHaveBeenCalledTimes(1);
				expect(executeSpy.mock.calls[0][0].level).toBe(Levels.WARN);
			});

			it('should combine an array of level keys into the message level', async () => {
				TRANSPORT.level.set(Levels.ALL);
				log.setGlobalLevel(Levels.ALL);
				log.clear();
				log.addTransport(TRANSPORT);

				await log.log(['error', 'trace'], 'level keys msg');
				log.setGlobalLevel(Levels.NONE);

				expect(executeSpy).toHaveBeenCalledTimes(1);
				expect(executeSpy.mock.calls[0][0].level).toBe(Levels.ERROR | Levels.TRACE);
			});

			it('should not execute transports when level key is unknown', async () => {
				await expect(log.log('fatal' as any, 'bad key msg')).resolves.toBe(false);

				expect(executeSpy).not.toHaveBeenCalled();
			});

			it(`should not throw when transport throws`, async () => {
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

				try {
					await expect(log.log(1, 'throw')).resolves.toBeDefined();
				} finally {
					log.clearAll();
				}
			});

			it(`should return list of failures when transports return false`, async () => {
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

				try {
					const res = await log.log(1, 'fails');
					expect(res).toEqual(
						expect.objectContaining({
							SyncAction: false,
							AsyncAction: expect.any(Error)
						})
					);
					expect((res as Record<string, Error>).AsyncAction.message).toBe('err');
				} finally {
					log.clearAll();
				}
			});

			it(`should return true when transports return true`, async () => {
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

				try {
					await expect(log.log(1, 'works')).resolves.toBe(true);
				} finally {
					log.clearAll();
				}
			});

			it(`should call parent tranports`, async () => {
				log.clearAll();
				log.addTransport(TRANSPORT);
				const childLog = log.make('child', {enabled: true, level: Levels.ALL});
				expect(ACTION).not.toHaveBeenCalled();

				await childLog.error('msg');

				expect(ACTION).toHaveBeenCalled();
			});

			it(`should not call parent tranports if child has transport with the same id`, async () => {
				log.clearAll();
				log.addTransport(TRANSPORT);
				const childLog = log.make('child', {enabled: true, level: Levels.ALL});
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
