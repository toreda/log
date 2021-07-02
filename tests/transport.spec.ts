import {TransportAction} from '../src/log/action';
import {Levels} from '../src/levels';
import {Message} from '../src/log/message';
import {Transport} from '../src/transport';

const MOCK_ID = 'log_transport_id';
const MOCK_LEVEL: Levels = Levels.NONE | Levels.ERROR;

describe('Transport', () => {
	let action: TransportAction;
	let level: Levels;
	beforeAll(() => {
		action = () => true;
	});

	beforeEach(() => {
		level = Levels.NONE | Levels.ERROR;
	});

	describe('Constructor', () => {
		it('should throw when id arg is undefined', () => {
			expect(() => {
				new Transport(undefined as any, level, action);
			}).toThrow('Transport init failure - id arg is missing.');
		});

		it('should throw when id arg is null', () => {
			expect(() => {
				new Transport(null as any, level, action);
			}).toThrow('Transport init failure - id arg is missing.');
		});

		it('should throw when id arg is not a string', () => {
			expect(() => {
				new Transport(14081871 as any, level, action);
			}).toThrow('Transport init failure - id arg must be a non-empty string.');
		});

		it('should throw when action arg is undefined', () => {
			expect(() => {
				new Transport(MOCK_ID, MOCK_LEVEL, undefined as any);
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - action arg is missing.`);
		});

		it('should throw when id action arg is not a function', () => {
			expect(() => {
				new Transport(MOCK_ID, level, 1408141 as any);
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - action arg must be a function.`);
		});
	});

	describe('Implementation', () => {
		describe('execute', () => {
			const sampleMsg: Message = {
				level: Levels.ERROR | Levels.TRACE,
				message: 'aaaa 01841 10481048 1444671',
				date: Date.now(),
				path: ['one', 'three']
			};

			it('should pass msg to action call', async () => {
				const sampleAction = jest.fn();
				const custom = new Transport(MOCK_ID, Levels.ALL, sampleAction);
				expect(sampleAction).not.toHaveBeenCalled();

				await custom.execute(sampleMsg);
				expect(sampleAction).toHaveBeenCalledTimes(1);
				expect(sampleAction).toHaveBeenLastCalledWith(sampleMsg);
			});
		});
	});
});
