import {ArmorActionResultCode} from '@armorjs/action-result';
import {EventEmitter} from 'events';
import {LogListener} from '../src/log-listener';
import {Logger} from '../src/logger';

describe('LogLogger', () => {
	const DEFAULT_STATE = {
		levels: ['error', 'warn', 'info', 'debug', 'trace']
	};

	let instance: Logger;

	beforeAll(() => {
		instance = new Logger();
	});

	describe('Constructor', () => {
		describe('contructor', () => {
			it('should instantiate when no args are given', () => {
				let custom = new Logger();
				expect(custom).toBeInstanceOf(Logger);
			});
		});

		describe('parseOptions', () => {
			it('should always return a LoggerState', () => {
				let result = instance.parseOptions(undefined);

				expect(result.events).toBeInstanceOf(EventEmitter);
				expect(typeof result.id).toBe('string');
				expect(Array.isArray(result.levels)).toBe(true);
				expect(result.listenerNames).toStrictEqual([]);
				expect(result.listeners).toStrictEqual({});
			});
		});

		describe('parseOptionsEvents', () => {
			it('should always return an EventEmitter', () => {
				expect(instance.parseOptionsEvents(undefined)).toBeInstanceOf(EventEmitter);
				expect(instance.parseOptionsEvents({} as any)).toBeInstanceOf(EventEmitter);

				let expectedV = new EventEmitter();
				expect(instance.parseOptionsEvents(expectedV)).toBe(expectedV);
			});
		});

		describe('parseOptionsId', () => {
			it('should always return a string', () => {
				expect(typeof instance.parseOptionsId(undefined)).toBe('string');
				expect(typeof instance.parseOptionsId({} as any)).toBe('string');

				let expectedV = 'testing id';
				expect(instance.parseOptionsId(expectedV)).toBe(expectedV);
			});
		});

		describe('parseOptionsLevels', () => {
			it('should always return an array', () => {
				expect(Array.isArray(instance.parseOptionsLevels(undefined))).toBe(true);
				expect(Array.isArray(instance.parseOptionsLevels({} as any))).toBe(true);

				let expectedV = ['test level 1', 'test level 2'];
				expect(instance.parseOptionsLevels(expectedV)).toBe(expectedV);
			});
		});
	});

	describe('Helpers', () => {
		describe('parseLevel', () => {
			it('should return max levelNum and its levelStr if level is null', () => {
				let expectedNum = instance.state.levels.length - 1;
				let expectedStr = instance.state.levels[expectedNum];
				let {levelNum: resultNum, levelStr: resultStr} = instance.parseLevel(undefined);
				expect(resultNum).toBe(expectedNum);
				expect(resultStr).toBe(expectedStr);
			});

			describe.each`
				type        | arg
				${'number'} | ${'Num'}
				${'string'} | ${'Str'}
			`('should return levelNum and levelStr if level is a $type', ({arg}) => {
				it.each([0, 1, 2, 3, 4])('level[%p]', (expectedNum) => {
					let expectedV = {Num: expectedNum, Str: instance.state.levels[expectedNum]};
					let {levelNum: resultNum, levelStr: resultStr} = instance.parseLevel(expectedV[arg]);
					expect(resultNum).toBe(expectedV.Num);
					expect(resultStr).toBe(expectedV.Str);
				});
			});

			it.each([-50, -1, 0, 1, 50])('should always return a levelNum in levels range, %p', (level) => {
				let result = instance.parseLevel(level);
				expect(result.levelNum).toBeGreaterThanOrEqual(0);
				expect(result.levelNum).toBeLessThan(instance.state.levels.length);
			});
		});
	});

	describe('Implementation', () => {
		let testSuite = [
			['null', null],
			['number', -9],
			['number', -1],
			['number', 0],
			['number', 1],
			['number', 9],
			['string', ''],
			['string', '-5'],
			['string', '-1'],
			['string', '0'],
			['string', '1'],
			['string', '5'],
			['string', 'abc']
		];

		beforeEach(() => {
			instance.state.listenerNames.forEach((lsn, idx, arr) => {
				instance.removeListener(lsn);
			});
		});

		describe('attachListener', () => {
			it('should add listener to Logger.listeners', () => {
				expect(instance.state.listenerNames.length).toBe(0);

				instance.attachListener(0);
				expect(instance.state.listenerNames.length).toBe(1);

				instance.attachListener(1);
				expect(instance.state.listenerNames.length).toBe(2);
			});

			it.each(testSuite)('should return new LogListener, target is %p: %p', (type: any, target: any) => {
				expect(instance.state.listenerNames.length).toBe(0);

				let result = instance.attachListener(target);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(result.payload).toBeInstanceOf(LogListener);
			});

			it('should return with target as payload if target is LogListener', () => {
				expect(instance.state.listenerNames.length).toBe(0);

				let expectedV = new LogListener(instance, instance.state.events);

				let result = instance.attachListener(expectedV);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(result.payload).toBe(expectedV);
			});

			it('should use name if name is defined and target is not a LogListener', () => {
				expect(instance.state.listenerNames.length).toBe(0);

				let expectedV = 'test name';

				let result = instance.attachListener(0, expectedV);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(result.payload.state.name).toBe(expectedV);
			});

			it('should return a failure if new collides with preexisting listener', () => {
				expect(instance.state.listenerNames.length).toBe(0);

				let collision = 'testname';

				let resultPass = instance.attachListener(0, collision);
				expect(resultPass.code).toBe(ArmorActionResultCode.SUCCESS);

				let resultFail = instance.attachListener(0, collision);
				expect(resultFail.code).toBe(ArmorActionResultCode.FAILURE);
			});
		});

		describe('chooseListener', () => {
			it.each(testSuite.filter((v) => v[0] === 'string'))(
				'should return a LogListener if one exists, %p: %p',
				(type: any, name: any) => {
					expect(instance.state.listenerNames.length).toBe(0);
					expect(instance.chooseListener(name)).toBeUndefined();
					let expectedV = instance.attachListener(0, name);
					expect(expectedV.code).toBe(ArmorActionResultCode.SUCCESS);
					expect(instance.chooseListener(name)).toBe(expectedV.payload);
				}
			);

			it.each([
				[-5, 0],
				[-1, 2],
				[0, 0],
				[1, 1],
				[5, 2]
			])('should return a LogListener if one exists, "number": %p', (index: any, fixed: any) => {
				expect(instance.state.listenerNames.length).toBe(0);

				expect(instance.chooseListener(index)).toBeUndefined();

				let limit = 3;
				for (let i = 0; i < limit; i++) {
					instance.attachListener();
				}

				expect(instance.state.listenerNames.length).toBe(limit);
				let expectedV = instance.state.listenerNames[fixed];

				expect(instance.chooseListener(index).state.name).toBe(expectedV);
			});
		});

		describe('removeListener', () => {
			it('should return removed listener if target is LogListener', () => {
				let expectedV = instance.attachListener();
				let result = instance.removeListener(expectedV.payload);
				expect(result.payload).toBe(expectedV.payload);
			});

			it('should call chooseListener if target is a number or string', () => {
				let spy = jest.spyOn(instance, 'chooseListener');
				let expectedCalls = 0;

				instance.removeListener('');
				expectedCalls++;
				expect(spy).toBeCalledTimes(expectedCalls);

				instance.removeListener('abc');
				expectedCalls++;
				expect(spy).toBeCalledTimes(expectedCalls);

				instance.removeListener(0);
				expectedCalls++;
				expect(spy).toBeCalledTimes(expectedCalls);

				instance.removeListener(1);
				expectedCalls++;
				expect(spy).toBeCalledTimes(expectedCalls);
			});

			it('should return null if it not found', () => {
				expect(instance.state.listenerNames.length).toBe(0);

				let spy = jest.spyOn(instance, 'chooseListener').mockReturnValueOnce(null!);

				let result = instance.removeListener(0);
				expect(result.code).toBe(ArmorActionResultCode.FAILURE);
				expect(result.payload).toBeNull();
			});

			it('should return null if target is null', () => {
				expect(instance.state.listenerNames.length).toBe(0);

				let result = instance.removeListener(null!);
				expect(result.code).toBe(ArmorActionResultCode.FAILURE);
				expect(result.payload).toBeNull();
			});

			it('should remove target from listeners and listenerNames', () => {
				expect(instance.state.listenerNames.length).toBe(0);

				let listener = instance.attachListener();
				expect(instance.state.listenerNames.length).toBe(1);
				expect(listener.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(instance.chooseListener(listener.payload.state.name)).toBeDefined();

				let result = instance.removeListener(listener.payload);
				expect(instance.state.listenerNames.length).toBe(0);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(instance.chooseListener(result.payload.state.name)).toBeUndefined();
			});

			it('should disable target listener', () => {
				expect(instance.state.listenerNames.length).toBe(0);

				let listener = instance.attachListener();
				let logs = listener.payload.state.logs;
				expect(logs.length).toBe(0);

				instance.log(0, 'log-listener test message 1');
				expect(logs.length).toBe(1);

				instance.removeListener(listener.payload);
				instance.log(0, 'log-listener test message 2');
				expect(logs.length).toBe(1);
			});
		});

		describe('log', () => {
			it('should call parseLevel with level arg', () => {
				let spy = jest.spyOn(instance, 'parseLevel');
				let expectedV = 0;
				expect(spy).toBeCalledTimes(expectedV);

				instance.log('');
				expectedV++;
				expect(spy).toBeCalledTimes(expectedV);

				instance.log(4);
				expectedV++;
				expect(spy).toBeCalledTimes(expectedV);

				instance.log('warn');
				expectedV++;
				expect(spy).toBeCalledTimes(expectedV);

				instance.log('not valid');
				expectedV++;
				expect(spy).toBeCalledTimes(expectedV);
			});

			it('should emit a "LogEvent" with a message containing {levelNum, levelStr, message}', () => {
				let spy = jest.spyOn(instance.state.events, 'emit');
				instance.log('');
				expect(spy).toBeCalled();
			});

			it('should return Logger', () => {
				expect(instance.log('')).toBe(instance);
			});
		});
	});
});
