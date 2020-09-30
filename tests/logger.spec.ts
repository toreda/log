import {EventEmitter} from 'events';
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
		describe('attachListener', () => {
			it.todo('should return a failure if there is no listener');

			it.todo('should return a failure if new collides with preexisting listener');

			it.todo('should return with target as payload if target is LogListener');

			it.todo('should return with new LogListener as payload if target is string');

			it.todo('should return with new LogListener as payload if target is number');

			it.todo('should add listener to Logger.listeners');

			it.todo('should use name if name is defined and target is not a LogListener');
		});

		describe('chooseListener', () => {
			it.todo('should return a LogListener if one exists');

			it.todo('should return null if name does not match a listener');
		});

		describe('removeListener', () => {
			it.todo('should return null if target is null');

			it.todo('should return null a listener is not removed');

			it.todo('should remove target from Logger.listeners');

			it.todo('should disable target listener');

			it.todo('should return removed listener if target is LogListener');

			it.todo('should return removed listener if target is string');

			it.todo('should return removed listener if target is number');
		});

		describe('log', () => {
			it.todo('should call parseLevel with level arg');

			it.todo('should emit a "LogEvent" with a message containing {levelNum, levelStr, message}');

			it.todo('should return Logger');
		});
	});
});
