import {LogAction} from 'src/log/action';
import {LogLevels} from 'src/log/levels';
import {LogMessage} from 'src/log/message';
import {LogTransport} from 'src/log/transport';

const MOCK_ID = 'log_transport_id';
const MOCK_LEVEL: LogLevels = LogLevels.NONE | LogLevels.ERROR;

describe('LogTransport', () => {
	let action: LogAction;
	let level: LogLevels;
	beforeAll(() => {
		action = async (msg: LogMessage): Promise<boolean> => {
			return true;
		};
	});

	beforeEach(() => {
		level = LogLevels.NONE | LogLevels.ERROR;
	});

	describe('Constructor', () => {
		it('should throw when id arg is undefined', () => {
			expect(() => {
				const custom = new LogTransport(undefined as any, level, action);
			}).toThrow('Log Transport init failure - id arg is missing.');
		});

		it('should throw when id arg is null', () => {
			expect(() => {
				const custom = new LogTransport(null as any, level, action);
			}).toThrow('Log Transport init failure - id arg is missing.');
		});

		it('should throw when id arg is not a string', () => {
			expect(() => {
				const custom = new LogTransport(14081871 as any, level, action);
			}).toThrow('Log Transport init failure - id arg must be a non-empty string.');
		});

		it('should throw when action arg is undefined', () => {
			expect(() => {
				const custom = new LogTransport(MOCK_ID, MOCK_LEVEL, undefined as any);
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - action arg is missing.`);
		});

		it('should throw when id action arg is not a function', () => {
			expect(() => {
				const custom = new LogTransport(MOCK_ID, level, 1408141 as any);
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - action arg must be a function.`);
		});
	});

	describe('Implementation', () => {
		describe('execute', () => {
			it('should pass msg to action call', async () => {
				const sampleAction = jest.fn();
				const custom = new LogTransport(MOCK_ID, LogLevels.ALL, sampleAction);
				expect(sampleAction).not.toHaveBeenCalled();
				const sampleMsg: LogMessage = {
					level: LogLevels.ERROR | LogLevels.TRACE,
					message: 'aaaa 01841 10481048 1444671',
					date: Date.now().toLocaleString()
				};

				await custom.execute(sampleMsg);
				expect(sampleAction).toHaveBeenCalledTimes(1);
				expect(sampleAction).toHaveBeenLastCalledWith(sampleMsg);
			});
		});
	});
});
