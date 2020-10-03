import {LogMessage} from '../src/log-message';
import {LogTransport} from '../src/log-transport';
import {LogTransportAction} from '../src/log-transport-action';

describe('Logger', () => {
	let action: LogTransportAction;
	let consoleSpy: jest.SpyInstance;
	let instance: LogTransport;
	let logMessage: LogMessage = {
		date: new Date().toISOString(),
		level: 'ERROR',
		message: 'this is a LogMessage'
	};

	beforeAll(() => {
		action = (logMessage) => {
			return new Promise((resolve, reject) => {
				process.nextTick(() => {
					if (logMessage == null) {
						return reject({
							message: 'failure'
						});
					}

					return resolve({message: logMessage.message});
				});
			});
		};

		consoleSpy = jest.spyOn(console, 'error');

		instance = new LogTransport(action);
	});

	beforeEach(() => {
		consoleSpy.mockClear();
	});

	afterEach(() => {});

	describe('Constructor', () => {
		it('should throw if action is not a funciton', () => {
			expect(() => {
				new LogTransport(undefined!);
			}).toThrow('LogTransport init failed - action should be a function');
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

	describe('Helpers', () => {
		describe('execute', () => {
			it('should call action', () => {
				// expect.assertions(1);
				// expect(instance.execute(null!));
				// expect(action).toBeCalled();
				// expect(consoleSpy).not.toBeCalled();
			});

			// it('should log error if action fails', async () => {
			// expect.assertions(1);
			// const data = await instance.execute(undefined!);
			// expect(action).toBeCalled();
			// expect(consoleSpy).toBeCalled();
			// });
		});
	});
});
