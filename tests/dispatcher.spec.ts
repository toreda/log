import { ArmorLogDispatcher } from '../src/dispatcher';
import { EventEmitter } from 'events';

describe("Dispatcher", () => {
	let instance: ArmorLogDispatcher;
	let events: EventEmitter;

	beforeAll(() => {
		events = new EventEmitter();
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

		it('should initialize the handlers property to an empty object', () => {
			const customInstance = new ArmorLogDispatcher(events);
			expect(customInstance.handlers).toEqual({});
		});
	});
});