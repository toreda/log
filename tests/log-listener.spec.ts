import {EventEmitter} from 'events';
import {LogListener} from '../src/log-listener';
import {Logger} from '../src/logger';

describe('LogLogger', () => {
	let instance: LogListener;

	beforeAll(() => {
		let logger = new Logger();
		instance = new LogListener(logger, logger.state.events, {level: 2});
	});

	beforeEach(() => {
		instance.state.logs.length = 0;
	});

	describe('Constructor', () => {
		describe('contructor', () => {
			let events = new EventEmitter();
			let parent = new Logger({events: events});

			it('should throw if parent is missing', () => {
				expect(() => {
					let custom = new LogListener(undefined!, events);
				}).toThrow('LogListener init failed - no parent argument provided.');
			});

			it('should throw if parent is not a Logger', () => {
				expect(() => {
					let custom = new LogListener({} as Logger, events);
				}).toThrow('LogListener init failed - parent argument not a valid Logger instance.');
			});

			it('should throw if events is missing', () => {
				expect(() => {
					let custom = new LogListener(parent, undefined!);
				}).toThrow('LogListener init failed - no events argument provided.');
			});

			it('should throw if event is not an EventEmitter', () => {
				expect(() => {
					let custom = new LogListener(parent, {} as EventEmitter);
				}).toThrow('LogListener init failed - events argument not a valid EventEmitter instance.');
			});

			it('should call enable', () => {
				events.removeAllListeners();
				let custom = new LogListener(parent, events);
				expect(custom.events.listenerCount(custom.state.eventId)).toBe(1);
				custom.disable();
				expect(custom.events.listenerCount(custom.state.eventId)).toBe(0);
			});
		});

		describe('parseOptions', () => {
			it('should always return a LogListenerState', () => {
				let result = instance.parseOptions(undefined);
				let expectedV = ['action', 'eventId', 'levelNum', 'levelStr', 'logs', 'name'];

				let resultKeys = Object.keys(result).sort((a, b) => (a < b ? -1 : +1));

				expect(resultKeys).toStrictEqual(expectedV);

				expect(typeof result.action).toBe('function');
				expect(result.eventId).toContain('LogEvent');
				expect(result.levelNum).toBe(0);
				expect(result.levelStr).toBe('error');
				expect(result.logs).toStrictEqual([]);
				expect(result.name).toBe('');
			});
		});

		describe('parseOptionsAction', () => {
			it('should always return a function', () => {
				expect(typeof instance.parseOptionsAction(undefined)).toBe('function');

				let expectedV = () => {};
				expect(instance.parseOptionsAction(expectedV)).toBe(expectedV);
			});
		});

		describe('parseOptionsLevelNum', () => {
			it('should always return a number', () => {
				let expectInfoNum = 2;
				expect(instance.parseOptionsLevelNum(undefined)).toBe(0);
				expect(instance.parseOptionsLevelNum('1')).toBe(0);
				expect(instance.parseOptionsLevelNum(2)).toBe(expectInfoNum);
				expect(instance.parseOptionsLevelNum('info')).toBe(expectInfoNum);
			});
		});

		describe('parseOptionsLevelStr', () => {
			it('should always return a string', () => {
				let expectInfoStr = 'info';
				expect(instance.parseOptionsLevelStr(undefined)).toBe('error');
				expect(instance.parseOptionsLevelStr('1')).toBe('error');
				expect(instance.parseOptionsLevelStr(2)).toBe(expectInfoStr);
				expect(instance.parseOptionsLevelStr('info')).toBe(expectInfoStr);
			});
		});

		describe('parseOptionsName', () => {
			it('should always return a string', () => {
				expect(instance.parseOptionsName(undefined)).toBe('');
				expect(instance.parseOptionsName(2 as any)).toBe('');
				expect(instance.parseOptionsName('testing name')).toBe('testing name');
			});
		});
	});

	describe('Helpers', () => {
		describe('handleMessage', () => {
			it('should have a bound this', () => {
				let {handleMessage} = instance;
				expect(() => {
					handleMessage(undefined!);
				}).not.toThrow();
			});

			it('should skip message if message level < listener level', () => {
				instance.handleMessage({
					message: 'message 1',
					levelNum: 0,
					levelStr: 'error'
				});
				expect(instance.state.logs.length).toBe(0);
			});

			it('should add message if message level >= listener level', () => {
				instance.handleMessage({
					message: 'message 1',
					levelNum: 4,
					levelStr: 'trace'
				});
				expect(instance.state.logs.length).toBe(1);
			});
		});
	});

	describe('Implementation', () => {
		describe('enable', () => {
			it('should enable LogListener to log future emits', () => {
				let spy = jest.spyOn(instance.events, 'on');
				instance.enable();
				expect(spy).toBeCalledTimes(1);
			});
		});

		describe('disable', () => {
			it('should disable LogListener from logging future emits', () => {
				let spy = jest.spyOn(instance.events, 'off');
				instance.disable();
				expect(spy).toBeCalledTimes(1);
			});
		});

		describe('showLogs', () => {
			let spy: jest.SpyInstance;
			let logOutput: string;

			beforeAll(() => {
				spy = jest.spyOn(console, 'log').mockImplementation((logs: string) => {
					logOutput = logs;
				});
			});

			afterAll(() => {
				spy.mockRestore();
			});

			it('should call Logger.parseLevel with level args', () => {
				let spy = jest.spyOn(instance.parent, 'parseLevel');
				let expectedCalls = 0;
				let expectedArg: any;

				expectedArg = undefined;
				expectedCalls++;
				instance.showLogs(expectedArg);
				expect(spy).toBeCalledTimes(expectedCalls);
				expect(spy).toBeCalledWith(expectedArg);

				expectedArg = 2;
				expectedCalls++;
				instance.showLogs(expectedArg);
				expect(spy).toBeCalledTimes(expectedCalls);
				expect(spy).toBeCalledWith(expectedArg);

				expectedArg = 'string-test';
				expectedCalls++;
				instance.showLogs(expectedArg);
				expect(spy).toBeCalledTimes(expectedCalls);
				expect(spy).toBeCalledWith(expectedArg);
			});

			it('should create string[] of messages with levelNum < level', () => {
				let expectedCount = 0;
				let expectedLog = '';
				expect(instance.state.logs.length).toBe(expectedCount);
				instance.state.levelNum = 0;
				instance.state.levelStr = instance.parent.state.levels[0];

				for (; expectedCount < 10; expectedCount++) {
					instance.parent.log(
						expectedCount % instance.parent.state.levels.length,
						'logger test message ' + expectedCount
					);
				}
				expect(instance.state.logs.length).toBe(expectedCount);

				let filterLevel = 2;
				let logs = instance.state.logs
					.filter((log) => {
						return log.levelNum <= filterLevel;
					})
					.map((log) => {
						return `${log.levelStr.toUpperCase()}: ${JSON.stringify(log.message)}`;
					});

				expectedLog = `${instance.state.name}: ${instance.state.levelStr}\n`;
				expectedLog += logs.join('\n');
				instance.showLogs(filterLevel);
				expect(logOutput).toStrictEqual(expectedLog);
			});
		});
	});
});
