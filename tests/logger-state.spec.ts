import {LoggerState} from '../src/logger-state';

describe('LoggerState', () => {
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
});
