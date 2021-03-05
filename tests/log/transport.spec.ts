import {LogMessage} from '../../src/log/message';
import {LogTransport} from '../../src/log/transport';
import {LogTransportAction} from '../../src/log/transport/action';
import {LogLevels} from '../../src/log/levels';

describe('LogTransport', () => {
	let action: LogTransportAction;
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
			expect(() => {}).toThrow('');
		});
	});
});
