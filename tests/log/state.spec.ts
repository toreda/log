import {LogState} from '../../src/log/state';

describe('LogState', () => {
	let instance: LogState;

	beforeAll(() => {
		instance = new LogState();
	});

	describe('constructor', () => {
		it('should call parse with options', () => {
			let spy = jest.spyOn(LogState.prototype, 'parse');
			const expectedV = {
				id: 'TestId124'
			};
			new LogState(expectedV);
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
