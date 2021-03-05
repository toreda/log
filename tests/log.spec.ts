import {appendFileSync, unlinkSync} from 'fs';

import {Log} from '../src/log';
import {LogLevels} from '../src/log/levels';
import {LogTransport} from '../src/log/transport';
import {LogTransportAction} from '../src/log/transport/action';
import {LogMessage} from '../src/log/message';

describe('Log', () => {
	let instance: Log;
	let action: LogTransportAction;
	let transport: LogTransport;

	beforeAll(() => {
		instance = new Log();
	});

	beforeEach(() => {
		action = async (msg: LogMessage): Promise<boolean> => {
			return true;
		};

		transport = new LogTransport('test', LogLevels.ALL, action);
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

		beforeEach(() => {
			action = async (msg: LogMessage): Promise<boolean> => {
				return true;
			};
		});

		describe('addTransport', () => {
			it('should return false when transport arg is undefined', () => {
				expect(instance.addTransport(undefined as any)).toBe(false);
			});

			it('should return false when transport arg is null', () => {
				expect(instance.addTransport(null as any)).toBe(false);
			});

			it('should return true when transport is added', () => {
				const transport = new LogTransport('test', LogLevels.ALL, action);

				expect(instance.addTransport(transport)).toBe(true);
			});

			it('should return true each time the same transport is added', () => {
				const transport = new LogTransport('test', LogLevels.ALL, action);
				const log = new Log();
				for (let i = 0; i < 5; i++) {
					expect(log.addTransport(transport)).toBe(true);
				}
			});

			it('should not add the same transport more than once', () => {
				const transport = new LogTransport('test', LogLevels.ALL, action);
				const log = new Log();
				for (let i = 0; i < 5; i++) {
					expect(log.addTransport(transport)).toBe(true);
				}
			});
		});

		describe('addGroupTransport', () => {
			it('should create group and add transport when group does not exist', () => {
				const groupId = '@97141876';
				const transport = new LogTransport('test', LogLevels.ALL, action);
				instance.addGroupTransport(groupId, transport);
				const group = instance.state.groups[groupId];
				expect(group).not.toBeUndefined();
				expect(Array.isArray(group.transports)).toBe(true);
				expect(group.transports[0]).toBe(transport);
			});

			it('should return true when add transport is successful', () => {
				const groupId = '@97141876';
				const transport = new LogTransport('id', LogLevels.ALL, action);
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
				const transport = new LogTransport('id', LogLevels.ALL, action);
				const log = new Log();
				expect(log.removeTransport(transport)).toBe(false);
			});

			it('should return false when transport arg is undefined', () => {
				const log = new Log();
				expect(log.removeTransport(undefined as any)).toBe(false);
			});

			it('should remove target transport from default group', () => {
				const transport = new LogTransport('id', LogLevels.ALL, action);
				const log = new Log();
				expect(log.state.groups.all.transports).toHaveLength(0);
				log.addTransport(transport);
				expect(log.state.groups.all.transports).toHaveLength(1);
				log.removeTransport(transport);
				expect(log.state.groups.all.transports).toHaveLength(0);
			});

			it('should return true when target transport is removed from default group', () => {
				const transport = new LogTransport('test', LogLevels.ALL, action);
				const log = new Log();
				expect(log.state.groups.all.transports).toHaveLength(0);
				log.addTransport(transport);
				expect(log.state.groups.all.transports).toHaveLength(1);
				const result = log.removeTransport(transport);
				expect(log.state.groups.all.transports).toHaveLength(0);
				expect(result).toBe(true);
			});
		});

		describe('getGroup', () => {
			it('should return null when groupId arg is undefined', () => {
				expect(instance.getGroup(undefined as any)).toBeNull();
			});

			it('should return null when groupId arg is null', () => {
				expect(instance.getGroup(null as any)).toBeNull();
			});

			it('should create and return group when groupId does not exist', () => {
				const log = new Log();
				const groupId = '29J09FV100';
				expect(log.state.groups[groupId]).toBeUndefined();
				const group = log.getGroup(groupId);
				expect(group).toBeDefined();
			});
		});
	});
});
