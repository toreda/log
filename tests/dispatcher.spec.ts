import { ArmorLogDispatcher } from '../src/dispatcher';
import { EventEmitter } from 'events';

describe("Dispatcher", () => {
	let instance: ArmorLogDispatcher;
	let events: EventEmitter;

	beforeAll(() => {
		events = new EventEmitter();
		instance = new ArmorLogDispatcher(events);
	});

	describe("Constructor", () => {
		it("should throw when events argument not provided", () => {
			expect(() => {
				const customInstance = new ArmorLogDispatcher(undefined as any);
			}).toThrow('Armor Log Dispatcher init failed - no events argument provided.');
		});

		it('should throw when events argument is not an EventEmitter instance', () => {
			expect(() => {
				const customInstance = new ArmorLogDispatcher([] as any);
			}).toThrow('Armor Log Dispatcher init failed - events argument was not a valid EventEmitter instance.');
		});

		it('should set the events property to the provided events argument', () => {
			const customEvents = new EventEmitter();
			const customInstance = new ArmorLogDispatcher(customEvents);
			expect(customInstance.events).toBe(customEvents);
		});

		it('should initialize the groups property to an empty object', () => {
			const customInstance = new ArmorLogDispatcher(events);
			expect(customInstance.groups).toEqual({});
		});

		it('should initialize nextListenerId to 0', () => {
			const customInstance = new ArmorLogDispatcher(events);
			expect(customInstance.nextListenerId).toBe(0);
		});
	});

	describe("createListener", () => {
		it('should not throw when processor argument is missing', () => {
			expect(() => {
				const result = instance.createListener(undefined as any);
			}).not.toThrow();
		});

		it('should return null when processor argument is not a processor', () => {
			expect(instance.createListener(undefined as any)).toBeNull();
		});
	});

	describe("getNextListenerId", () => {
		it('should increment the listener id after each call', () => {
			const customInstance = new ArmorLogDispatcher(events);
			expect(customInstance.nextListenerId).toBe(0);
			let id = customInstance.getNextListenerId();
			expect(id).toBe(0);
			let incremented = customInstance.getNextListenerId();
			expect(incremented).toBe(1);
		});
	});
});