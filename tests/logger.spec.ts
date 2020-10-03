import {appendFileSync, unlinkSync} from 'fs';

import {ArmorActionResultCode} from '@armorjs/action-result';
import {LogLevels} from '../src/log-levels';
import {LogTransport} from '../src/log-transport';
import {LogTransportAction} from '../src/log-transport-action';
import {Logger} from '../src/logger';

describe('Logger', () => {
	let instance: Logger;

	beforeAll(() => {
		instance = new Logger();
	});

	beforeEach(() => {});

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

				let expectedV = ['id', 'consoleEnabled', 'transportNames', 'transportGroups'];
				expectedV.sort((a, b) => (a < b ? -1 : +1));

				let resultKeys = Object.keys(result).sort((a, b) => (a < b ? -1 : +1));

				expect(resultKeys).toStrictEqual(expectedV);

				expect(result.transportNames).toStrictEqual({});
				expect(result.transportGroups).toStrictEqual({});
			});
		});
	});

	describe('Helpers', () => {});

	describe('Implementation', () => {
		let reuseTransport: LogTransport;
		let groupsForEach: Function;
		let spy: jest.SpyInstance;

		beforeAll(() => {
			let action: LogTransportAction = () => {
				return new Promise((resolve, reject) => {
					return resolve();
				});
			};

			reuseTransport = new LogTransport(action);

			spy = jest.spyOn(reuseTransport, 'execute');

			groupsForEach = (func) => {
				Object.keys(instance.state.transportGroups).forEach((key) => {
					func(instance.state.transportGroups[key]);
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
				let result = instance.attachTransport(reuseTransport);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(Object.keys(instance.state.transportNames).length).toBe(1);
			});

			it('should succeed and increase transportGroups[level].length if transport was a LogTransport', () => {
				let result = instance.attachTransport(reuseTransport);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				groupsForEach((group) => expect(group.length).toBe(1));
			});

			it('should succeed and return LogTransport if transport was a LogTransport', () => {
				let result = instance.attachTransport(reuseTransport);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(result.payload).toBe(reuseTransport);
			});

			it('should fail if transport was not a LogTransport', () => {
				let result = instance.attachTransport(undefined!);

				expect(result.code).toBe(ArmorActionResultCode.FAILURE);
				expect(result.state.errors.map((err) => err.message)).toContain('transport is not a LogTransport');
			});
		});

		describe('removeTransport', () => {
			it('should succeed and decrease transportNames.length if transport was removed', () => {
				expect(instance.attachTransport(reuseTransport).code).toBe(ArmorActionResultCode.SUCCESS);
				expect(Object.keys(instance.state.transportNames).length).toBe(1);

				let result = instance.removeTransport(reuseTransport);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(Object.keys(instance.state.transportNames).length).toBe(0);
			});

			it('should succeed and decrease transportGroups[level].length if transport was removed', () => {
				expect(instance.attachTransport(reuseTransport).code).toBe(ArmorActionResultCode.SUCCESS);
				groupsForEach((group) => expect(group.length).toBe(1));

				let result = instance.removeTransport(reuseTransport);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				groupsForEach((group) => expect(group.length).toBe(0));
			});

			it('should succeed and return LogTransport if transport was removed', () => {
				expect(instance.attachTransport(reuseTransport).code).toBe(ArmorActionResultCode.SUCCESS);

				let result = instance.removeTransport(reuseTransport);
				expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
				expect(result.payload).toBe(reuseTransport);
			});

			it('should fail if transport was not a LogTransport', () => {
				expect(instance.attachTransport(reuseTransport).code).toBe(ArmorActionResultCode.SUCCESS);

				let result = instance.removeTransport(undefined!);
				expect(result.code).toBe(ArmorActionResultCode.FAILURE);
				expect(result.state.errors.map((err) => err.message)).toContain('transport is not a LogTransport');
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
				let expectedV = {
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

				let secondParam = 'second test string';
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
					// console.log(message);
					appendFileSync(path, message + ',\n');
					return resolve();
				});
			};

			expect(typeof action).toBe('function');
			const transport = new LogTransport(action);

			let result = instance.attachTransport(transport, LogLevels.INFO);

			expect(result.code).toBe(ArmorActionResultCode.SUCCESS);
			expect(result.payload).toBeInstanceOf(LogTransport);

			instance.error('message 0');
			instance.warn('message 1');
			instance.info({mes: 'sage'});
			instance.debug([12, 3, 4, 5]);
			instance.trace('message 4');
		});
	});
});
