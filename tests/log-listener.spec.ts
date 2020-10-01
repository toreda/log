import {EventEmitter} from 'events';
import {LogListener} from '../src/log-listener';
import {Logger} from '../src/logger';

describe('LogLogger', () => {
	let instance: LogListener;

	beforeAll(() => {
		let logger = new Logger();
		instance = new LogListener(logger.events, logger, 2, 'test listener');
	});

	beforeEach(() => {
		instance.logs.length = 0;
	});

	describe('Constructor', () => {
		describe('contructor', () => {
			let events = new EventEmitter();
			let parent = new Logger(events);

			it('should throw if events is missing', () => {
				expect(() => {
					let custom = new LogListener(undefined!, parent);
				}).toThrow('LogListener init failed - no events argument provided.');
			});

			it('should throw if event is not an EventEmitter', () => {
				expect(() => {
					let custom = new LogListener({} as EventEmitter, parent);
				}).toThrow('LogListener init failed - events argument not a valid EventEmitter instance.');
			});

			it('should throw if parent is missing', () => {
				expect(() => {
					let custom = new LogListener(events, undefined!);
				}).toThrow('LogListener init failed - no parent argument provided.');
			});

			it('should throw if parent is not a Logger', () => {
				expect(() => {
					let custom = new LogListener(events, {} as Logger);
				}).toThrow('LogListener init failed - parent argument not a valid Logger instance.');
			});

			it('should default to 0 if level is undefined', () => {
				let expectedV = 0;
				let custom = new LogListener(events, parent);
				expect(custom.levelNum).toBe(expectedV);
				expect(custom.levelStr).toBe(parent.levels[expectedV]);
			});

			it('should use level if it is given as number', () => {
				let expectedV = 2;
				let custom = new LogListener(events, parent, expectedV);
				expect(custom.levelNum).toBe(expectedV);
				expect(custom.levelStr).toBe(parent.levels[expectedV]);
			});

			it('should use level if it is given as string', () => {
				let expectedV = 'info';
				let custom = new LogListener(events, parent, 'info');
				expect(custom.levelStr).toBe(expectedV);
				expect(custom.levelNum).toBe(parent.levels.findIndex((level) => level == expectedV));
			});

			it('should default to "" if name is undefined', () => {
				let expectedV = '';
				let custom = new LogListener(events, parent);
				expect(custom.name).toBe(expectedV);
			});

			it('should use name if it is given', () => {
				let expectedV = 'test-name';
				let custom = new LogListener(events, parent, undefined, expectedV);
				expect(custom.name).toBe(expectedV);
			});

			it('should replace this.action if action is given', () => {
				let expectedV = (arg) => 'test return';
				let custom = new LogListener(events, parent, undefined, undefined, expectedV);
				expect(custom.action(undefined!)).toBe(expectedV(undefined));
			});

			it('should call enable', () => {
				events.removeAllListeners();
				let custom = new LogListener(events, parent);
				expect(custom.events.listenerCount('LogEvent')).toBe(1);
				custom.disable();
				expect(custom.events.listenerCount('LogEvent')).toBe(0);
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
				expect(instance.logs.length).toBe(0);
			});

			it('should add message if message level >= listener level', () => {
				instance.handleMessage({
					message: 'message 1',
					levelNum: 4,
					levelStr: 'trace'
				});
				expect(instance.logs.length).toBe(1);
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
				expect(instance.logs.length).toBe(expectedCount);
				instance.levelNum = 0;
				instance.levelStr = instance.parent.levels[0];

				for (; expectedCount < 10; expectedCount++) {
					instance.parent.log(
						expectedCount % instance.parent.levels.length,
						'logger test message ' + expectedCount
					);
				}
				expect(instance.logs.length).toBe(expectedCount);

				let filterLevel = 2;
				let logs = instance.logs
					.filter((log) => {
						return log.levelNum <= filterLevel;
					})
					.map((log) => {
						return `${log.levelStr.toUpperCase()}: ${JSON.stringify(log.message)}`;
					});

				expectedLog = `${instance.name}: ${instance.levelStr}\n`;
				expectedLog += logs.join('\n');
				instance.showLogs(filterLevel);
				expect(logOutput).toStrictEqual(expectedLog);
			});
		});
	});
});
