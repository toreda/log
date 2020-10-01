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

			it('should instantiate when events is not an EventEmitter', () => {
				let custom = new Logger(undefined);
				expect(custom.events).toBeInstanceOf(EventEmitter);
			});

			it('should instantiate and use events when it is given', () => {
				let expectedV = new EventEmitter();
				let custom = new Logger(expectedV);
				expect(custom.events).toBe(expectedV);
			});

			it('should start with empty listeners', () => {
				let custom = new Logger();
				expect(custom.listeners).toStrictEqual({});
				expect(custom.listenerNames).toStrictEqual([]);
			});

			it('should use defaults levels if not given custom ones', () => {
				let custom = new Logger();
				expect(custom.levels).toStrictEqual(DEFAULT_STATE.levels);
			});

			it('should use levels given in options', () => {
				let expectedV = ['fatal', 'issue', 'info'];
				let custom = new Logger(undefined, {levels: expectedV});
				expect(custom.levels).toStrictEqual(expectedV);
			});

			it.todo('should create function for each level');
		});

		describe('parseEvents', () => {
			it.each`
				events  | expected              | because
				${null} | ${'new EventEmitter'} | ${'null'}
				${{}}   | ${'new EventEmitter'} | ${'not an EventEmitter'}
			`('should return $expected when events is $because', ({events}) => {
				let result = instance.parseEvents(events as any);
				expect(result).toBeInstanceOf(EventEmitter);
				expect(result).not.toBe(events);
			});

			it('should return events when events is an EventEmitter', () => {
				let events = new EventEmitter();
				let result = instance.parseEvents(events);
				expect(result).toBe(events);
			});
		});

		describe('parseOptions', () => {
			it('should return default state if options is undefined', () => {
				expect(instance.parseOptions(null!)).toStrictEqual(DEFAULT_STATE);
				expect(instance.parseOptions(undefined)).toStrictEqual(DEFAULT_STATE);
			});

			it('should return edited default state', () => {
				let expectedV = {...DEFAULT_STATE};
				expectedV.levels = ['crash', 'debug', 'basic'];
				expect(instance.parseOptions(expectedV)).toStrictEqual(expectedV);
			});
		});
	});

	describe('Helpers', () => {
		describe('parseLevel', () => {
			it('should return max levelNum and its levelStr if level is null', () => {
				let expectedNum = instance.levels.length - 1;
				let expectedStr = instance.levels[expectedNum];
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
					let expectedV = {Num: expectedNum, Str: instance.levels[expectedNum]};
					let {levelNum: resultNum, levelStr: resultStr} = instance.parseLevel(expectedV[arg]);
					expect(resultNum).toBe(expectedV.Num);
					expect(resultStr).toBe(expectedV.Str);
				});
			});

			it.each([-50, -1, 0, 1, 50])('should always return a levelNum in levels range, %p', (level) => {
				let result = instance.parseLevel(level);
				expect(result.levelNum).toBeGreaterThanOrEqual(0);
				expect(result.levelNum).toBeLessThan(instance.levels.length);
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
			instance.listenerNames.forEach((lsn, idx, arr) => {
				instance.removeListener(lsn);
			});
		});

		describe('attachListener', () => {
			it('should add listener to Logger.listeners', () => {
				expect(instance.listenerNames.length).toBe(0);

				instance.attachListener(0);
				expect(instance.listenerNames.length).toBe(1);

				instance.attachListener(1);
				expect(instance.listenerNames.length).toBe(2);
			});

			it.each(testSuite)('should return new LogListener, target is %p: %p', (type: any, target: any) => {
				expect(instance.listenerNames.length).toBe(0);

				let result = instance.attachListener(target);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(result.payload).toBeInstanceOf(LogListener);
			});

			it('should return with target as payload if target is LogListener', () => {
				expect(instance.listenerNames.length).toBe(0);

				let expectedV = new LogListener(instance.events, instance);

				let result = instance.attachListener(expectedV);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(result.payload).toBe(expectedV);
			});

			it('should use name if name is defined and target is not a LogListener', () => {
				expect(instance.listenerNames.length).toBe(0);

				let expectedV = 'test name';

				let result = instance.attachListener(0, expectedV);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(result.payload.name).toBe(expectedV);
			});

			it('should return a failure if new collides with preexisting listener', () => {
				expect(instance.listenerNames.length).toBe(0);

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
					expect(instance.listenerNames.length).toBe(0);
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
				expect(instance.listenerNames.length).toBe(0);

				expect(instance.chooseListener(index)).toBeUndefined();

				let limit = 3;
				for (let i = 0; i < limit; i++) {
					instance.attachListener();
				}

				expect(instance.listenerNames.length).toBe(limit);
				let expectedV = instance.listenerNames[fixed];

				expect(instance.chooseListener(index).name).toBe(expectedV);
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
				expect(instance.listenerNames.length).toBe(0);

				let spy = jest.spyOn(instance, 'chooseListener').mockReturnValueOnce(null!);

				let result = instance.removeListener(0);
				expect(result.code).toBe(ArmorActionResultCode.FAILURE);
				expect(result.payload).toBeNull();
			});

			it('should return null if target is null', () => {
				expect(instance.listenerNames.length).toBe(0);

				let result = instance.removeListener(null!);
				expect(result.code).toBe(ArmorActionResultCode.FAILURE);
				expect(result.payload).toBeNull();
			});

			it('should remove target from listeners and listenerNames', () => {
				expect(instance.listenerNames.length).toBe(0);

				let listener = instance.attachListener();
				expect(instance.listenerNames.length).toBe(1);
				expect(listener.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(instance.chooseListener(listener.payload.name)).toBeDefined();

				let result = instance.removeListener(listener.payload);
				expect(instance.listenerNames.length).toBe(0);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(instance.chooseListener(result.payload.name)).toBeUndefined();
			});

			it('should disable target listener', () => {
				expect(instance.listenerNames.length).toBe(0);

				let listener = instance.attachListener();
				let logs = listener.payload.logs;
				expect(logs.length).toBe(0);

				instance.log(0, 'test message 1');
				expect(logs.length).toBe(1);

				instance.removeListener(listener.payload);
				instance.log(0, 'test message 2');
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
				let spy = jest.spyOn(instance.events, 'emit');
				instance.log('');
				expect(spy).toBeCalled();
			});

			it('should return Logger', () => {
				expect(instance.log('')).toBe(instance);
			});
		});
	});
});
