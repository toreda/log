import {LogMessage} from '../src/log-message';
import {LogTransport} from '../src/log-transport';
import {LogTransportAction} from '../src/log-transport-action';
import {LogTransportState} from '../src/log-transport-state';

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

		instance = new LogTransport(action);
	});

	beforeEach(() => {
		instance.state.logs([]);
	});

	describe('Constructor', () => {
		describe('constructor', () => {
			it('should call parseExecute', () => {
				let spy = jest.spyOn(LogTransport.prototype, 'parseExecute').mockReturnValueOnce(null!);
				new LogTransport();
				expect(spy).toBeCalledTimes(1);
			});

			it('should call LogTransportState.parseOptionsId', () => {
				const spy = jest.spyOn(LogTransportState.prototype, 'parseOptionsId').mockReturnValueOnce(null!);

				const expectedV = {
					id: 'TestingId8624'
				};
				new LogTransport(action, expectedV);
				expect(spy).toBeCalledWith(expectedV);
			});

			it('should instantiate when no args are given', () => {
				expect(new LogTransport()).toBeInstanceOf(LogTransport);
			});
		});

		describe('parseOptionsExecute', () => {
			it('should return a function if execute was undefined', () => {
				expect(instance.parseExecute()).toBe(instance.storeLog);
			});

			it('should throw if execute is not a funciton', () => {
				expect(() => {
					instance.parseExecute({} as any);
				}).toThrow('LogTransport init failed - execute should be a function');
			});

			it('should return action if it was a function', () => {
				let customAction: LogTransportAction = (msg): any => {
					return msg;
				};

				let resultAction = instance.parseExecute(customAction);

				expect(resultAction(LOG_MESSAGE_RESOLVE)).toBe(customAction(LOG_MESSAGE_RESOLVE));
			});
		});
	});

	describe('Helpers', () => {
		describe('storeLog', () => {
			it('should call console log with logMessage data', () => {
				expect(instance.state.logs().length).toBe(0);

				let expectedV = '';
				expectedV += `[${LOG_MESSAGE_RESOLVE.date}]`;
				expectedV += ` ${LOG_MESSAGE_RESOLVE.level.toUpperCase()}:`;
				expectedV += ` ${LOG_MESSAGE_RESOLVE.message}`;

				instance.storeLog(LOG_MESSAGE_RESOLVE);

				expect(instance.state.logs().length).toBe(1);
			});
		});

		describe('logToConsole', () => {
			it('should call console log with logMessage data', () => {
				let spy = jest.spyOn(console, 'log').mockImplementation();
				let expectedV = '';
				expectedV += `[${LOG_MESSAGE_RESOLVE.date}]`;
				expectedV += ` ${LOG_MESSAGE_RESOLVE.level.toUpperCase()}:`;
				expectedV += ` ${LOG_MESSAGE_RESOLVE.message}`;

				LogTransport.logToConsole(LOG_MESSAGE_RESOLVE);

				expect(spy).toBeCalledWith(expectedV);
				spy.mockRestore();
			});
		});

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
