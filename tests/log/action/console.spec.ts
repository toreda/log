import {LogActionConsole} from '../../../src/log/action/console';
import {LogMessage} from '../../../src/log/message';
import {LogLevels} from '../../../src/log/levels';

describe('LogActionConsole', () => {
	let msg: LogMessage;

	beforeEach(() => {
		msg = {
			date: '',
			level: LogLevels.DEBUG,
			message: 'msg goes here'
		};
	});

	describe('console logging methods', () => {
		it('should call console.error when level is ERROR', async () => {
			const spy = jest.spyOn(global.console, 'error');
			expect(spy).not.toHaveBeenCalled();
			msg.level = LogLevels.ERROR;
			await LogActionConsole(msg);
			expect(spy).toHaveBeenCalledTimes(1);

			spy.mockRestore();
		});

		it('should call console.error when level is DEBUG', async () => {
			const spy = jest.spyOn(global.console, 'debug');
			expect(spy).not.toHaveBeenCalled();
			msg.level = LogLevels.DEBUG;
			await LogActionConsole(msg);
			expect(spy).toHaveBeenCalledTimes(1);

			spy.mockRestore();
		});

		it('should call console.error when level is WARN', async () => {
			const spy = jest.spyOn(global.console, 'warn');
			expect(spy).not.toHaveBeenCalled();
			msg.level = LogLevels.WARN;
			await LogActionConsole(msg);
			expect(spy).toHaveBeenCalledTimes(1);

			spy.mockRestore();
		});

		it('should call console.error when level is INFO', async () => {
			const spy = jest.spyOn(global.console, 'info');
			expect(spy).not.toHaveBeenCalled();
			msg.level = LogLevels.INFO;
			await LogActionConsole(msg);
			expect(spy).toHaveBeenCalledTimes(1);

			spy.mockRestore();
		});

		it('should call console.error when level is TRACE', async () => {
			const spy = jest.spyOn(global.console, 'trace');
			expect(spy).not.toHaveBeenCalled();
			msg.level = LogLevels.TRACE;
			await LogActionConsole(msg);
			expect(spy).toHaveBeenCalledTimes(1);

			spy.mockRestore();
		});

		it('should call console.log when level is not a supported log level', async () => {
			const spy = jest.spyOn(global.console, 'log');
			expect(spy).not.toHaveBeenCalled();
			msg.level = LogLevels.NONE;
			await LogActionConsole(msg);
			expect(spy).toHaveBeenCalledTimes(1);

			spy.mockRestore();
		});
	});
});
