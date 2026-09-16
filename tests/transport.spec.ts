import {Levels} from '../src/levels';
import {Message} from '../src/message';
import {Transport} from '../src/transport';
import {TransportAction} from '../src/transport/action';

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
				new Transport({id: undefined as any, level, action});
			}).toThrow('[logtr] Init failure - id arg is missing.');
		});

		it('should throw when id arg is null', () => {
			expect(() => {
				new Transport({id: null as any, level, action});
			}).toThrow('[logtr] Init failure - id arg is missing.');
		});

		it('should throw when id arg is not a string', () => {
			expect(() => {
				new Transport({id: 14081871 as any, level, action});
			}).toThrow('[logtr] Init failure - id arg must be a non-empty string.');
		});

		it('should throw when id arg is an empty string', () => {
			expect(() => {
				new Transport({id: '', level, action});
			}).toThrow('[logtr] Init failure - id arg must be a non-empty string.');
		});

		it('should throw when action arg is undefined', () => {
			expect(() => {
				new Transport({id: MOCK_ID, level: MOCK_LEVEL, action: undefined as any});
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - action arg is missing.`);
		});

		it('should throw when action arg is null', () => {
			expect(() => {
				new Transport({id: MOCK_ID, level, action: null as any});
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - action arg is missing.`);
		});

		it('should throw when action arg is not a function', () => {
			expect(() => {
				new Transport({id: MOCK_ID, level, action: 1408141 as any});
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - action arg must be a function.`);
		});

		it('should report falsy non-function action as not a function', () => {
			expect(() => {
				new Transport({id: MOCK_ID, level, action: 0 as any});
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - action arg must be a function.`);
		});

		it('should throw when level arg is undefined', () => {
			expect(() => {
				new Transport({id: MOCK_ID, level: undefined as any, action});
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - level arg must be a valid log level.`);
		});

		it('should throw when level arg is negative', () => {
			expect(() => {
				new Transport({id: MOCK_ID, level: -1, action});
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - level arg must be a valid log level.`);
		});

		it('should throw when level arg is NaN', () => {
			expect(() => {
				new Transport({id: MOCK_ID, level: NaN, action});
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - level arg must be a valid log level.`);
		});

		it('should accept Levels.NONE as a valid level', () => {
			const custom = new Transport({id: MOCK_ID, level: Levels.NONE, action});
			expect(custom.level.get()).toBe(Levels.NONE);
		});

		it('should set id, action, and level', () => {
			const custom = new Transport({id: MOCK_ID, level: MOCK_LEVEL, action});
			expect(custom.id).toBe(MOCK_ID);
			expect(custom.action).toBe(action);
			expect(custom.level.get()).toBe(MOCK_LEVEL);
		});

		it('should accept a level key', () => {
			const custom = new Transport({id: MOCK_ID, level: 'error', action});
			expect(custom.level.get()).toBe(Levels.ERROR);
		});

		it('should combine an array of level keys and bitmasks', () => {
			const custom = new Transport({id: MOCK_ID, level: ['error', Levels.TRACE], action});
			expect(custom.level.get()).toBe(Levels.ERROR | Levels.TRACE);
		});

		it('should throw when level arg is an unknown key', () => {
			expect(() => {
				new Transport({id: MOCK_ID, level: 'fatal' as any, action});
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - level arg must be a valid log level.`);
		});

		it('should throw when level arg is an empty array', () => {
			expect(() => {
				new Transport({id: MOCK_ID, level: [], action});
			}).toThrow(`[logtr:${MOCK_ID}] Init failure - level arg must be a valid log level.`);
		});
	});

	describe('Implementation', () => {
		describe('execute', () => {
			const sampleMsg: Message = {
				level: Levels.ERROR | Levels.TRACE,
				message: ['aaaa 01841 10481048 1444671'],
				date: Date.now(),
				path: ['one', 'three']
			};

			it('should pass msg to action call', async () => {
				const sampleAction = jest.fn();
				const custom = new Transport({id: MOCK_ID, level: Levels.ALL, action: sampleAction});
				expect(sampleAction).not.toHaveBeenCalled();

				await custom.execute(sampleMsg);
				expect(sampleAction).toHaveBeenCalledTimes(1);
				expect(sampleAction).toHaveBeenLastCalledWith(sampleMsg);
			});

			it('should resolve with sync action return value', async () => {
				const custom = new Transport({id: MOCK_ID, level: Levels.ALL, action: () => true});
				await expect(custom.execute(sampleMsg)).resolves.toBe(true);
			});

			it('should resolve with async action return value', async () => {
				const custom = new Transport({id: MOCK_ID, level: Levels.ALL, action: async () => false});
				await expect(custom.execute(sampleMsg)).resolves.toBe(false);
			});

			it('should resolve with error when action throws', async () => {
				const err = new Error('sync failure');
				const custom = new Transport({
					id: MOCK_ID,
					level: Levels.ALL,
					action: () => {
						throw err;
					}
				});
				await expect(custom.execute(sampleMsg)).resolves.toBe(err);
			});

			it('should resolve with error when action rejects', async () => {
				const err = new Error('async failure');
				const custom = new Transport({
					id: MOCK_ID,
					level: Levels.ALL,
					action: () => Promise.reject(err)
				});
				await expect(custom.execute(sampleMsg)).resolves.toBe(err);
			});

			it('should wrap non-error throw values in an Error', async () => {
				const custom = new Transport({
					id: MOCK_ID,
					level: Levels.ALL,
					action: () => {
						throw 'string failure';
					}
				});
				const result = await custom.execute(sampleMsg);
				expect(result).toBeInstanceOf(Error);
				expect((result as Error).message).toBe('string failure');
			});
		});
	});
});
