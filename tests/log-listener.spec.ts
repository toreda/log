// import {EventEmitter} from 'events';
// import {LogListener} from '../src/log-listener';
// import {Logger} from '../src/logger';

// describe('LogListener', () => {
// 	let instance: LogListener;

// 	beforeAll(() => {
// 		let logger = new Logger();
// 		instance = new LogListener(logger, logger.state.events, {level: 2});
// 	});

// 	beforeEach(() => {
// 		instance.state.logs.length = 0;
// 	});

// 	describe('Constructor', () => {
// 		describe('contructor', () => {
// 			let events = new EventEmitter();
// 			let parent = new Logger({events: events});

// 			it('should throw if parent is missing', () => {
// 				expect(() => {
// 					let custom = new LogListener(undefined!, events);
// 				}).toThrow('LogListener init failed - no parent argument provided.');
// 			});

// 			it('should throw if parent is not a Logger', () => {
// 				expect(() => {
// 					let custom = new LogListener({} as Logger, events);
// 				}).toThrow('LogListener init failed - parent argument not a valid Logger instance.');
// 			});

// 			it('should throw if events is missing', () => {
// 				expect(() => {
// 					let custom = new LogListener(parent, undefined!);
// 				}).toThrow('LogListener init failed - no events argument provided.');
// 			});

// 			it('should throw if event is not an EventEmitter', () => {
// 				expect(() => {
// 					let custom = new LogListener(parent, {} as EventEmitter);
// 				}).toThrow('LogListener init failed - events argument not a valid EventEmitter instance.');
// 			});

// 			it('should call enable', () => {
// 				events.removeAllListeners();
// 				let custom = new LogListener(parent, events);
// 				expect(custom.events.listenerCount(custom.state.eventId)).toBe(1);
// 				custom.disable();
// 				expect(custom.events.listenerCount(custom.state.eventId)).toBe(0);
// 			});
// 		});

// 		describe('parseOptions', () => {
// 			it('should always return a LogListenerState', () => {
// 				let result = instance.parseOptions(undefined);
// 				let expectedV = ['action', 'eventId', 'levelNum', 'levelStr', 'logs', 'name', 'silent'];

// 				let resultKeys = Object.keys(result).sort((a, b) => (a < b ? -1 : +1));

// 				expect(resultKeys).toStrictEqual(expectedV);

// 				expect(typeof result.action).toBe('function');
// 				expect(result.eventId).toContain('LogEvent');
// 				expect(result.levelNum).toBe(0);
// 				expect(result.levelStr).toBe('error');
// 				expect(result.logs).toStrictEqual([]);
// 				expect(result.name).toBe('');
// 				expect(result.silent).toBe(false);
// 			});
// 		});

// 		describe('parseOptionsAction', () => {
// 			it('should always return a function', () => {
// 				expect(typeof instance.parseOptionsAction(undefined)).toBe('function');

// 				let expectedV = () => {};
// 				expect(instance.parseOptionsAction(expectedV)).toBe(expectedV);
// 			});
// 		});

// 		describe('parseOptionsLevelNum', () => {
// 			it('should always return a number', () => {
// 				let expectInfoNum = 2;
// 				expect(instance.parseOptionsLevelNum(undefined)).toBe(0);
// 				expect(instance.parseOptionsLevelNum('1')).toBe(0);
// 				expect(instance.parseOptionsLevelNum(2)).toBe(expectInfoNum);
// 				expect(instance.parseOptionsLevelNum('info')).toBe(expectInfoNum);
// 			});
// 		});

// 		describe('parseOptionsLevelStr', () => {
// 			it('should always return a string', () => {
// 				let expectInfoStr = 'info';
// 				expect(instance.parseOptionsLevelStr(undefined)).toBe('error');
// 				expect(instance.parseOptionsLevelStr('1')).toBe('error');
// 				expect(instance.parseOptionsLevelStr(2)).toBe(expectInfoStr);
// 				expect(instance.parseOptionsLevelStr('info')).toBe(expectInfoStr);
// 			});
// 		});

// 		describe('parseOptionsName', () => {
// 			it('should always return a string', () => {
// 				expect(instance.parseOptionsName(undefined)).toBe('');
// 				expect(instance.parseOptionsName(2 as any)).toBe('');
// 				expect(instance.parseOptionsName('testing name')).toBe('testing name');
// 			});
// 		});

// 		describe('parseOptionsSilent', () => {
// 			it('should always return a boolean', () => {
// 				expect(instance.parseOptionsSilent(undefined)).toBe(false);
// 				expect(instance.parseOptionsSilent(2 as any)).toBe(false);
// 				expect(instance.parseOptionsSilent(true)).toBe(true);
// 				expect(instance.parseOptionsSilent(false)).toBe(false);
// 			});
// 		});
// 	});

// 	describe('Helpers', () => {
// 		describe('handleMessage', () => {
// 			let spy: jest.SpyInstance;

// 			it('should have a bound this', () => {
// 				let {handleMessage} = instance;
// 				expect(() => {
// 					handleMessage(undefined!);
// 				}).not.toThrow();
// 			});

// 			beforeAll(() => {
// 				spy = jest.spyOn(instance.state, 'action').mockImplementation(() => {});
// 			});

// 			beforeEach(() => {
// 				spy.mockClear();
// 			});

// 			afterAll(() => {
// 				spy.mockRestore();
// 			});

// 			it('should skip message if message level < listener level', () => {
// 				instance.handleMessage({
// 					message: ['message 1'],
// 					levelNum: 0,
// 					levelStr: 'error',
// 					date: Date.now()
// 				});
// 				expect(instance.state.logs.length).toBe(0);
// 			});

// 			it('should add message if message level >= listener level', () => {
// 				instance.handleMessage({
// 					message: ['message 1'],
// 					levelNum: 4,
// 					levelStr: 'trace',
// 					date: Date.now()
// 				});
// 				expect(instance.state.logs.length).toBe(1);
// 			});

// 			it('should call action if silent is false', () => {
// 				instance.state.silent = false;

// 				instance.handleMessage({
// 					message: ['handleMessage silent is false'],
// 					levelNum: 4,
// 					levelStr: 'trace',
// 					date: Date.now()
// 				});

// 				expect(spy).toBeCalled();
// 			});

// 			it('should call not action if silent is true', () => {
// 				instance.state.silent = true;

// 				instance.handleMessage({
// 					message: ['handleMessage silent is true'],
// 					levelNum: 4,
// 					levelStr: 'trace',
// 					date: Date.now()
// 				});

// 				expect(spy).not.toBeCalled();
// 			});
// 		});
// 	});

// 	describe('Implementation', () => {
// 		describe('enable', () => {
// 			it('should enable LogListener to log future emits', () => {
// 				let spy = jest.spyOn(instance.events, 'on');
// 				instance.enable();
// 				expect(spy).toBeCalledTimes(1);
// 			});
// 		});

// 		describe('disable', () => {
// 			it('should disable LogListener from logging future emits', () => {
// 				let spy = jest.spyOn(instance.events, 'off');
// 				instance.disable();
// 				expect(spy).toBeCalledTimes(1);
// 			});
// 		});

// 		describe('showLogs', () => {
// 			let spyAction: jest.SpyInstance;
// 			let logOutput: string;

// 			beforeAll(() => {
// 				spyAction = jest.fn((msg: any) => {
// 					logOutput = msg;
// 				});
// 			});

// 			afterAll(() => {});

// 			it('should call Logger.parseLevel with level args', () => {
// 				let spy = jest.spyOn(instance.parent, 'parseLevel');
// 				let expectedCalls = 0;
// 				let expectedArg: any;

// 				expectedArg = undefined;
// 				expectedCalls++;
// 				instance.showLogs(expectedArg, spyAction as any);
// 				expect(spy).toBeCalledTimes(expectedCalls);
// 				expect(spy).toBeCalledWith(expectedArg);

// 				expectedArg = 2;
// 				expectedCalls++;
// 				instance.showLogs(expectedArg, spyAction as any);
// 				expect(spy).toBeCalledTimes(expectedCalls);
// 				expect(spy).toBeCalledWith(expectedArg);

// 				expectedArg = 'string-test';
// 				expectedCalls++;
// 				instance.showLogs(expectedArg, spyAction as any);
// 				expect(spy).toBeCalledTimes(expectedCalls);
// 				expect(spy).toBeCalledWith(expectedArg);
// 			});

// 			it('should create string[] of messages with levelNum < level', () => {
// 				let expectedCount = 0;
// 				let expectedLog = '';
// 				expect(instance.state.logs.length).toBe(expectedCount);
// 				instance.state.levelNum = 0;
// 				instance.state.levelStr = instance.parent.state.levels[0];

// 				for (; expectedCount < 10; expectedCount++) {
// 					instance.parent.log(
// 						expectedCount % instance.parent.state.levels.length,
// 						'showLogs test message ' + expectedCount
// 					);
// 				}
// 				expect(instance.state.logs.length).toBe(expectedCount);

// 				let filterLevel = 2;
// 				let logs = instance.state.logs
// 					.filter((log) => {
// 						return log.levelNum <= filterLevel;
// 					})
// 					.map((log) => {
// 						return ` ${instance.parseLogMessage(log)}`;
// 					});

// 				let datestring = instance.createDateString(new Date());

// 				expectedLog = `[${datestring}] ${instance.state.name}: ${instance.state.levelStr}\n`;
// 				expectedLog += logs.join('\n');
// 				instance.showLogs(filterLevel, spyAction as any);
// 				expect(logOutput).toStrictEqual(expectedLog);
// 			});
// 		});
// 	});
// });
