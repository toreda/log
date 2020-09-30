import {LogListener} from '../src/log-listener';

describe('LogLogger', () => {
	let instance: LogListener;

	describe('Constructor', () => {
		describe('contructor', () => {
			it.todo('should throw if events is missing');

			it.todo('should throw if event is not an EventEmitter');

			it.todo('should throw if parent is missing');

			it.todo('should throw if parent is not a Logger');

			it.todo('should default to 0 if level is null');

			it.todo('should use level if it is given');

			it.todo('should default to "" if name is null');

			it.todo('should use name if it is given');

			it.todo('should replace this.action if action is given');

			it.todo('should bind this to action');

			it.todo('should call enable');
		});
	});

	describe('Helpers', () => {
		describe('action', () => {
			it.todo('should skip message if message level < listener level');

			it.todo('should add message if message level >= listener level');
		});
	});

	describe('Implementation', () => {
		describe('enable', () => {
			it.todo('should enable LogListener to log future emits');
		});

		describe('disable', () => {
			it.todo('should disable LogListener from logging future emits');
		});

		describe('showLogs', () => {
			it.todo('should call Logger.parseLevel with level args');

			it.todo('should iterate though LogListeners.logs');

			it.todo('should create string[] of messages with levelNum < level');
		});
	});
});
