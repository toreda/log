import {logToConsole} from '../src/console';
import {Levels} from '../src/levels';
import {Message} from '../src/message';

const spys = {
	error: jest.spyOn(global.console, 'error').mockImplementation(() => {}),
	warn: jest.spyOn(global.console, 'warn').mockImplementation(() => {}),
	info: jest.spyOn(global.console, 'info').mockImplementation(() => {}),
	debug: jest.spyOn(global.console, 'debug').mockImplementation(() => {}),
	trace: jest.spyOn(global.console, 'trace').mockImplementation(() => {}),
	log: jest.spyOn(global.console, 'log').mockImplementation(() => {})
};

describe('logToConsole', () => {
	let msg: Message;

	beforeEach(() => {
		msg = {
			date: 0,
			level: Levels.DEBUG,
			message: 'msg goes here',
			path: ['home', 'class']
		};

		for (const spy of Object.values(spys)) {
			spy.mockClear();
		}
	});

	describe('console logging methods', () => {
		it('should call console.error when level is ERROR', async () => {
			expect(spys.error).not.toHaveBeenCalled();
			msg.level = Levels.ERROR;
			await logToConsole(msg);
			expect(spys.error).toHaveBeenCalledTimes(1);
		});

		it('should call console.warn when level is WARN', async () => {
			expect(spys.warn).not.toHaveBeenCalled();
			msg.level = Levels.WARN;
			await logToConsole(msg);
			expect(spys.warn).toHaveBeenCalledTimes(1);
		});

		it('should call console.info when level is INFO', async () => {
			expect(spys.info).not.toHaveBeenCalled();
			msg.level = Levels.INFO;
			await logToConsole(msg);
			expect(spys.info).toHaveBeenCalledTimes(1);
		});

		it('should call console.debug when level is DEBUG', async () => {
			expect(spys.debug).not.toHaveBeenCalled();
			msg.level = Levels.DEBUG;
			await logToConsole(msg);
			expect(spys.debug).toHaveBeenCalledTimes(1);
		});

		it('should call console.trace when level is TRACE', async () => {
			expect(spys.trace).not.toHaveBeenCalled();
			msg.level = Levels.TRACE;
			await logToConsole(msg);
			expect(spys.trace).toHaveBeenCalledTimes(1);
		});

		it('should call console.log when level is not a supported log level', async () => {
			expect(spys.log).not.toHaveBeenCalled();
			msg.level = Levels.NONE;
			await logToConsole(msg);
			expect(spys.log).toHaveBeenCalledTimes(1);
		});
	});
});
