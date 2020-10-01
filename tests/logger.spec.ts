import {ArmorActionResultCode} from '@armorjs/action-result';
import {EventEmitter} from 'events';
import {LogListener} from '../src/log-listener';
import {Logger} from '../src/logger';

describe('LogLogger', () => {
	let instance: Logger;

	beforeAll(() => {
		instance = new Logger();
	});

	describe('Constructor', () => {
		describe('contructor', () => {
			it.todo('should instantiate when no args are given');

			it.todo('should instantiate and use events when it is given');

			it.todo('should start with empty listeners');

			it.todo('should use levels given in options');

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
			it.todo('should return default state if options is null');

			it.todo('should return edited default state');
		});
	});

	describe('Helpers', () => {
		describe('parseLevel', () => {
			it.todo('should return max levelNum and its levelStr if level is null');

			it.todo('should return levelNum and levelStr if level is a string');

			it.todo('should return levelNum and levelStr if level is a number');

			it.todo('should always return a levelNum and levelStr that are part of Logger');
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

			it.each(testSuite.filter((v) => v[1] != null).map((v) => v[1]))(
				'should return existing listener, target is string: %p',
				(target: any) => {
					expect(instance.listenerNames.length).toBe(0);

					let expectedV = instance.attachListener(0, target.toString());
					expect(expectedV.code).toBe(ArmorActionResultCode.SUCCESS);

					let result = instance.removeListener(target.toString());
					expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
					expect(result.payload).toBe(expectedV.payload);
				}
			);

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
