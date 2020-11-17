import {appendFileSync, unlinkSync} from 'fs';

import {ActionResultCode} from '@toreda/action-result';
import {Log} from '../src/log';
import {LogLevels} from '../src/log/levels';
import {LogState} from '../src/log/state';
import {LogTransport} from '../src/log/transport';
import {LogTransportAction} from '../src/log/transport/action';

describe('Log', () => {
	let instance: Log;

	beforeAll(() => {
		instance = new Log();
	});

	describe('Constructor', () => {
		describe('contructor', () => {
			it('should call LoggerState.parse', () => {
				const spy = jest.spyOn(LogState.prototype, 'parse').mockReturnValueOnce(null!);

				const expectedV = {
					id: 'TestingId9389'
				};

				new Log(expectedV);
				expect(spy).toBeCalledWith(expectedV);
			});

			it('should instantiate when no args are given', () => {
				expect(new Log()).toBeInstanceOf(Log);
			});
		});
	});

	describe('Implementation', () => {
		let reuseTransport: LogTransport;
		let groupsForEach: (arg1: unknown) => unknown;
		let spy: jest.SpyInstance;
		let action: LogTransportAction;

		beforeAll(() => {
			action = (): Promise<unknown> => {
				return new Promise((resolve, reject) => {
					return resolve();
				});
			};

			reuseTransport = new LogTransport(action, {id: 'reusable'});

			spy = jest.spyOn(reuseTransport, 'execute');

			groupsForEach = (func: (arg1: unknown, arg2: unknown) => unknown): void => {
				Object.keys(instance.state.transportGroups).forEach((key, index) => {
					func(instance.state.transportGroups[key], index);
				});
			};
		});

		beforeEach(() => {
			instance.state.transportNames = {};
			instance.state.transportGroups = {};

			spy.mockClear();

			expect(Object.keys(instance.state.transportNames).length).toBe(0);
			groupsForEach((group) => expect(group.length).toBe(0));
		});

		describe('attachTransport', () => {
			it('should succeed and increase transportNames.length if transport was a LogTransport', () => {
				const result = instance.attachTransport(reuseTransport);
				expect(result.isSuccess()).toBe(true);
				expect(Object.keys(instance.state.transportNames).length).toBe(1);
			});

			it('should succeed and increase transportGroups[level].length if transport was a LogTransport', () => {
				const result = instance.attachTransport(reuseTransport);
				expect(result.isSuccess()).toBe(true);
				groupsForEach((group) => expect(group.length).toBe(1));
			});

			it('should succeed and return LogTransport if transport was a LogTransport', () => {
				const result = instance.attachTransport(reuseTransport);
				expect(result.isSuccess()).toBe(true);
				expect(result.payload).toBe(reuseTransport);
			});

			it('should fail if transport was not a LogTransport', () => {
				const result = instance.attachTransport(undefined!);
				expect(result.isFailure()).toBe(true);
				expect(result.state.errorLog.map((err) => err.message)).toContain(
					'transport is not a LogTransport'
				);
			});
		});

		describe('getTransportFromId', () => {
			it('should return null if id is not a string', () => {
				expect(instance.getTransportFromId(undefined!)).toBeNull();
			});

			it('should return null no transport is found', () => {
				expect(instance.getTransportFromId('not in Logger')).toBeNull();
			});

			it('should return transport attached to Logger', () => {
				instance.attachTransport(reuseTransport);
				expect(instance.getTransportFromId(reuseTransport.state.id())).toBe(reuseTransport);
			});
		});

		describe('removeTransport', () => {
			it('should succeed and decrease transportNames.length if transport was removed', () => {
				instance.attachTransport(reuseTransport);
				expect(Object.keys(instance.state.transportNames).length).toBe(1);

				const result = instance.removeTransport(reuseTransport);
				expect(result.isSuccess()).toBe(true);
				expect(Object.keys(instance.state.transportNames).length).toBe(0);
			});

			it('should succeed and decrease transportGroups[level].length if transport was removed', () => {
				instance.attachTransport(reuseTransport);
				groupsForEach((group) => expect(group.length).toBe(1));

				const result = instance.removeTransport(reuseTransport);
				expect(result.isSuccess()).toBe(true);
				groupsForEach((group) => expect(group.length).toBe(0));
			});

			it('should succeed and return LogTransport if transport was removed', () => {
				instance.attachTransport(reuseTransport);

				const result = instance.removeTransport(reuseTransport);
				expect(result.isSuccess()).toBe(true);
				expect(result.payload).toBe(reuseTransport);
			});

			it('should succeed when multiple LogTransports exist', () => {
				const limit = 5;
				for (let i = 0; i < limit; i++) {
					instance.attachTransport(new LogTransport(action));
				}

				instance.attachTransport(reuseTransport);

				expect(Object.keys(instance.state.transportNames).length).toBe(limit + 1);
				groupsForEach((group) => expect(group.length).toBe(limit + 1));

				const result = instance.removeTransport(reuseTransport);
				expect(result.isSuccess()).toBe(true);
				expect(result.payload).toBe(reuseTransport);

				expect(Object.keys(instance.state.transportNames).length).toBe(limit);
				groupsForEach((group) => expect(group.length).toBe(limit));
			});

			it('should fail if transport was not a LogTransport', () => {
				instance.attachTransport(reuseTransport);

				const result = instance.removeTransport(undefined!);
				expect(result.isFailure()).toBe(true);
				expect(result.state.errorLog.map((err) => err.message)).toContain(
					'transport is not a LogTransport'
				);
			});

			it('should succeed but not remove anything if transport was not attached', () => {
				instance.attachTransport(new LogTransport(action));

				expect(Object.keys(instance.state.transportNames).length).toBe(1);
				groupsForEach((group) => expect(group.length).toBe(1));

				const result = instance.removeTransport(reuseTransport);
				expect(result.isSuccess()).toBe(true);
				expect(result.payload).toBe(reuseTransport);

				expect(Object.keys(instance.state.transportNames).length).toBe(1);
				groupsForEach((group) => expect(group.length).toBe(1));
			});

			it('should succeed only call splice on groups transport is in', () => {
				instance.attachTransport(new LogTransport(action));
				instance.attachTransport(reuseTransport, LogLevels.ERROR);

				const expectedGroupSizeInitial = [2, 1, 1, 1, 1];
				const expectedSizeFinal = 1;

				expect(Object.keys(instance.state.transportNames).length).toBe(2);
				groupsForEach((group, index) => expect(group.length).toBe(expectedGroupSizeInitial[index]));

				const spies: jest.SpyInstance[] = [];
				groupsForEach((group) => {
					spies.push(jest.spyOn(group, 'splice'));
				});

				const result = instance.removeTransport(reuseTransport);
				expect(result.isSuccess()).toBe(true);
				expect(result.payload).toBe(reuseTransport);

				expect(Object.keys(instance.state.transportNames).length).toBe(expectedSizeFinal);
				groupsForEach((group) => expect(group.length).toBe(expectedSizeFinal));
				spies.forEach((spliceSpy, index) => {
					expect(spliceSpy).toBeCalledTimes(expectedGroupSizeInitial[index] - expectedSizeFinal);
				});
			});
		});

		describe('log', () => {
			it('should not throw if not args are passed', () => {
				expect(() => {
					instance.log(undefined!);
				}).not.toThrow();
			});

			it('should execute transport action if transport level matches args', () => {
				let expectedCalls = 0;

				instance.attachTransport(reuseTransport, [LogLevels.ERROR, LogLevels.DEBUG]);

				expectedCalls++;
				instance.debug('debug test message - seen');
				expect(spy).toBeCalledTimes(expectedCalls);

				expectedCalls++;
				instance.error('error test message - seen');
				expect(spy).toBeCalledTimes(expectedCalls);

				instance.info('info test message - unseen');
				expect(spy).toBeCalledTimes(expectedCalls);

				instance.warn('warn test message - unseen');
				expect(spy).toBeCalledTimes(expectedCalls);
			});

			it.each`
				toLog
				${'string test message'}
				${1357924680}
				${[1, 2, 3, 4]}
				${{test: 'object message'}}
			`('should call execute with logMessage, $toLog', ({toLog}) => {
				instance.attachTransport(reuseTransport);
				let funcCalls = 0;
				let result: any;
				const expectedV = {
					level: LogLevels[1],
					message: '' as any
				};

				instance.log(LogLevels[expectedV.level]);
				result = spy.mock.calls[funcCalls][0];
				delete result.date;
				expect(result).toStrictEqual(expectedV);
				funcCalls++;

				expectedV.message = toLog;
				instance.log(LogLevels[expectedV.level], toLog);
				result = spy.mock.calls[funcCalls][0];
				delete result.date;
				expect(result).toStrictEqual(expectedV);
				funcCalls++;

				const secondParam = 'second test string';
				expectedV.message = [expectedV.message].concat(secondParam);
				instance.log(LogLevels[expectedV.level], toLog, secondParam);
				result = spy.mock.calls[funcCalls][0];
				delete result.date;
				expect(result).toStrictEqual(expectedV);
				funcCalls++;
			});
		});
	});

	describe('Total Functionality', () => {
		let name: string;
		let path: string;

		beforeAll(() => {
			name = 'Log File';
			path = 'tests/' + name + '.txt';
			try {
				unlinkSync(path);
			} catch (err) {}
			appendFileSync(path, '[{},' + '\n');
		});

		afterAll(() => {
			appendFileSync(path, '{}]' + '\n');
		});

		it('should create/find file and post logs there', () => {
			const action: LogTransportAction = (logMessage) => {
				return new Promise((resolve, reject) => {
					const message = JSON.stringify(logMessage);
					appendFileSync(path, message + ',\n');
					resolve();
				});
			};

			expect(typeof action).toBe('function');
			const transport = new LogTransport(action);

			const result = instance.attachTransport(transport, LogLevels.INFO);

			expect(result.isSuccess()).toBe(true);
			expect(result.payload).toBe(transport);

			instance.error('message 0');
			instance.warn('message 1');
			instance.info({mes: 'sage'});
			instance.debug([12, 3, 4, 5]);
			instance.trace('message 4');
		});
	});
});
