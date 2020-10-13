import {LoggerState} from '../src/logger-state';

describe('LoggerState', () => {
	let instance: LoggerState;

	beforeAll(() => {
		instance = new LoggerState();
	});

	describe('constructor', () => {
		it('should call parse with options', () => {
			let spy = jest.spyOn(LoggerState.prototype, 'parse');
			const expectedV = {
				id: 'TestId124'
			};
			new LoggerState(expectedV);
			expect(spy).toBeCalledWith(expectedV);
		});
	});

	describe('randomId', () => {
		it('should return a string of length 5', () => {
			let result = instance.randomId();
			expect(typeof result).toBe('string');
			expect(result.length).toBe(5);
		});
	});
});
