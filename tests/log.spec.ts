import {appendFileSync, unlinkSync} from 'fs';

import {Log} from '../src/log';
import {LogLevels} from '../src/log/levels';
import {LogTransport} from '../src/log/transport';
import {LogTransportAction} from '../src/log/transport/action';

describe('Log', () => {
	let instance: Log;

	beforeAll(() => {
		instance = new Log();
	});

	beforeEach(() => {
		instance.clearAll();
	});

	describe('Constructor', () => {
		it('should instantiate when no args are given', () => {
			expect(new Log()).toBeInstanceOf(Log);
		});
	});

	describe('Implementation', () => {
		let spy: jest.SpyInstance;
		let action: LogTransportAction;

		beforeAll(() => {
			action = (): Promise<unknown> => {
				return new Promise((resolve) => {
					return resolve(true);
				});
			};
		});

		beforeEach(() => {});

		describe('addTransport', () => {
			it('should return false when transport arg is undefined', () => {
				expect(instance.addTransport(undefined as any)).toBe(false);
			});

			it('should return false when transport arg is null', () => {
				expect(instance.addTransport(null as any)).toBe(false);
			});

			it('should return true when transport is added', () => {
				const transport = new LogTransport(LogLevels.ALL);

				expect(instance.addTransport(transport)).toBe(true);
			});

			it('should return true each time the same transport is added', () => {
				const transport = new LogTransport(LogLevels.ALL);
				const log = new Log();
				for (let i = 0; i < 5; i++) {
					expect(log.addTransport(transport)).toBe(true);
				}
			});

			it('should not add the same transport more than once', () => {
				const transport = new LogTransport(LogLevels.ALL);
				const log = new Log();
				for (let i = 0; i < 5; i++) {
					expect(log.addTransport(transport)).toBe(true);
				}
			});
		});

		describe('addGroupTransport', () => {
			it('should create group and add transport when group does not exist', () => {
				const groupId = '@97141876';
				const transport = new LogTransport(LogLevels.ALL);
				instance.addGroupTransport(groupId, transport);
				const group = instance.state.groups[groupId];
				expect(group).not.toBeUndefined();
				expect(Array.isArray(group.transports)).toBe(true);
				expect(group.transports[0]).toBe(transport);
			});

			it('should return true when add transport is successful', () => {
				const groupId = '@97141876';
				const transport = new LogTransport(LogLevels.ALL);
				expect(instance.addGroupTransport(groupId, transport)).toBe(true);
			});

			it('should return false and should not add a transport when transport arg is undefined', () => {
				const groupId = '90249274';
				const group = instance.getGroup(groupId);
				expect(group!.transports).toHaveLength(0);
				expect(instance.addGroupTransport(groupId, undefined as any)).toBe(false);
				expect(group!.transports).toHaveLength(0);
			});

			it('should return false and should not add a transport when transport arg is null', () => {
				const groupId = '30891408';
				const group = instance.getGroup(groupId);
				expect(group!.transports).toHaveLength(0);
				expect(instance.addGroupTransport(groupId, null as any)).toBe(false);
				expect(group!.transports).toHaveLength(0);
			});
		});

		describe('removeTransport', () => {
			it('should return false when target transport does not exist in default group', () => {
				const transport = new LogTransport(LogLevels.ALL);
				const log = new Log();
				expect(log.removeTransport(transport)).toBe(false);
			});

			it('should return false when transport arg is undefined', () => {
				const log = new Log();
				expect(log.removeTransport(undefined as any)).toBe(false);
			});

			it('should remove target transport from default group', () => {
				const transport = new LogTransport(LogLevels.ALL);
				const log = new Log();
				expect(log.state.groups.all.transports).toHaveLength(0);
				log.addTransport(transport);
				expect(log.state.groups.all.transports).toHaveLength(1);
				log.removeTransport(transport);
				expect(log.state.groups.all.transports).toHaveLength(0);
			});

			it('should return true when target transport is removed from default group', () => {
				const transport = new LogTransport(LogLevels.ALL);
				const log = new Log();
				expect(log.state.groups.all.transports).toHaveLength(0);
				log.addTransport(transport);
				expect(log.state.groups.all.transports).toHaveLength(1);
				const result = log.removeTransport(transport);
				expect(log.state.groups.all.transports).toHaveLength(0);
				expect(result).toBe(true);
			});
		});
		/*** 
		describe('log', () => {
			it('should execute transport action if transport level matches args', () => {
				let expectedCalls = 0;

				instance.addTransport(reuseTransport, [LogLevels.ERROR, LogLevels.DEBUG]);

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
				instance.addTransport(reuseTransport);
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
	});***/

		/**** 
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
				return new Promise((resolve) => {
					const message = JSON.stringify(logMessage);
					appendFileSync(path, message + ',\n');
					resolve(true);
				});
			};

			expect(typeof action).toBe('function');
			const transport = new LogTransport(action);

			const result = instance.addTransport(transport, LogLevels.INFO);

			expect(result).toBe(true);
			expect(result.payload).toBe(transport);

			instance.error('message 0');
			instance.warn('message 1');
			instance.info({mes: 'sage'});
			instance.debug([12, 3, 4, 5]);
			instance.trace('message 4');
		});**/
	});
});
