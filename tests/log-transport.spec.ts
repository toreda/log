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

	let execute: LogTransportAction;
	let instance: LogTransport;

	beforeAll(() => {
		execute = (logMessage) => {
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

		instance = new LogTransport(execute);
	});

	describe('Constructor', () => {
		describe('constructor', () => {
			it('should throw if execute is not a funciton', () => {
				expect(() => {
					new LogTransport(undefined!);
				}).toThrow('LogTransport init failed - execute should be a function');
			});

			it('should throw if execute does not return a promise', () => {
				expect(() => {
					new LogTransport((): any => {});
				}).toThrow('LogTransport init failed - execute should return a Promise');
			});

			it('should call parseOptions', () => {
				let spy = jest.spyOn(LogTransport.prototype, 'parseOptions').mockReturnValueOnce(null!);
				new LogTransport(execute);
				expect(spy).toBeCalledTimes(1);
			});
		});

		describe('parseOptions', () => {
			it('should always return a LoggerState', () => {
				let result = instance.parseOptions(undefined);
				let expectedV = ['id', 'logs'];
				expectedV.sort((a, b) => (a < b ? -1 : +1));
				let resultKeys = Object.keys(result).sort((a, b) => (a < b ? -1 : +1));
				expect(resultKeys).toStrictEqual(expectedV);
				expect(result.logs).toStrictEqual([]);
			});
		});
	});

	describe('Helpers', () => {
		describe('execute', () => {
			it('should return resolved message', async () => {
				await expect(instance.execute(LOG_MESSAGE_RESOLVE)).resolves.toBe(LOG_MESSAGE_RESOLVE.message);
				await expect(instance.execute(LOG_MESSAGE_RESOLVE)).resolves.not.toThrow();
			}, 100);

			it('should return rejected message', async () => {
				await expect(instance.execute(LOG_MESSAGE_REJECT)).rejects.toBe(LOG_MESSAGE_REJECT.message);
				await expect(instance.execute(LOG_MESSAGE_REJECT)).rejects.not.toThrow();
			}, 100);

			it('should throw message', async () => {
				await expect(instance.execute(LOG_MESSAGE_THROW)).rejects.toThrow(LOG_MESSAGE_THROW.message);
			}, 100);
		});
	});
});
