import {LogMessage} from '../src/log-message';
import {LogTransport} from '../src/log-transport';
import {LogTransportAction} from '../src/log-transport-action';

describe('Logger', () => {
	const LOG_MESSAGE_RESOLVE: LogMessage = {
		date: new Date().toISOString(),
		level: 'ERROR',
		message: 'resolved'
	};
	const LOG_MESSAGE_REJECT: LogMessage = {
		date: new Date().toISOString(),
		level: 'ERROR',
		message: 'rejected'
	};
	const LOG_MESSAGE_THROW: LogMessage = {
		date: new Date().toISOString(),
		level: 'ERROR',
		message: 'threw'
	};

	let action: LogTransportAction;
	let instance: LogTransport;

	beforeAll(() => {
		action = (logMessage) => {
			return new Promise((resolve, reject) => {
				if (logMessage.message == 'resolved') {
					resolve(logMessage.message);
				} else if (logMessage.message == 'rejected') {
					reject(logMessage.message);
				} else {
					throw new Error(logMessage.message);
				}
			});
		};

		instance = new LogTransport({execute: action});
	});

	describe('Constructor', () => {
		describe('constructor', () => {
			it('should call parseOptions', () => {
				let spy = jest.spyOn(LogTransport.prototype, 'parseOptions').mockReturnValueOnce(null!);
				new LogTransport();
				expect(spy).toBeCalledTimes(1);
			});
		});

		describe('parseOptions', () => {
			it('should always return a LoggerState', () => {
				let expectedV = ['execute', 'id', 'logs'];
				expectedV.sort((a, b) => (a < b ? -1 : +1));

				let result = instance.parseOptions(undefined);
				let resultKeys = Object.keys(result).sort((a, b) => (a < b ? -1 : +1));

				expect(resultKeys).toStrictEqual(expectedV);
				expect(result.logs).toStrictEqual([]);
				expect(typeof result.execute).toBe('function');
			});
		});

		describe('parseOptionsExecute', () => {
			it('should return a promise function if execute was undefined', () => {
				expect(instance.parseOptionsExecute()).toBe(instance.defaultAction);
			});

			it('should throw if execute is not a funciton', () => {
				expect(() => {
					instance.parseOptionsExecute({} as any);
				}).toThrow('LogTransport init failed - execute should be a function');
			});

			it('should return execute if it was a function', () => {
				expect(instance.parseOptionsExecute(action)).toBe(action);
			});
		});
	});

	describe('Helpers', () => {
		describe('defaultAction', () => {
			it('should call console log with logMessage data', () => {
				let spy = jest.spyOn(console, 'log').mockImplementation();
				let expectedV = '';
				expectedV += `[${LOG_MESSAGE_RESOLVE.date}]`;
				expectedV += ` ${LOG_MESSAGE_RESOLVE.level.toUpperCase()}:`;
				expectedV += ` ${LOG_MESSAGE_RESOLVE.message}`;

				instance.defaultAction(LOG_MESSAGE_RESOLVE);

				expect(spy).toBeCalledWith(expectedV);
				spy.mockRestore();
			});
		});

		describe('execute', () => {
			it('should return resolved message', async () => {
				await expect(instance.state.execute(LOG_MESSAGE_RESOLVE)).resolves.toBe(LOG_MESSAGE_RESOLVE.message);
				await expect(instance.state.execute(LOG_MESSAGE_RESOLVE)).resolves.not.toThrow();
			}, 100);

			it('should return rejected message', async () => {
				await expect(instance.state.execute(LOG_MESSAGE_REJECT)).rejects.toBe(LOG_MESSAGE_REJECT.message);
				await expect(instance.state.execute(LOG_MESSAGE_REJECT)).rejects.not.toThrow();
			}, 100);

			it('should throw message', async () => {
				await expect(instance.state.execute(LOG_MESSAGE_THROW)).rejects.toThrow(LOG_MESSAGE_THROW.message);
			}, 100);
		});
	});
});
