import {LoggerState} from '../src/logger-state';

describe('LoggerState', () => {
	let instance: LoggerState;

	beforeAll(() => {
		instance = new LoggerState();
	});

	describe('constructor', () => {
		it('should call parseOptionsId with options', () => {
			let spy = jest.spyOn(LoggerState.prototype, 'parseOptionsId');
			const expectedV = {
				id: 'TestId124'
			};
			new LoggerState(expectedV);
			expect(spy).toBeCalledWith(expectedV);
		});
	});

	describe('parseOptionsId', () => {
		it.each([undefined, 9023, '', 'random string 8'])('should return a TBString: %p', (input) => {
			expect(instance.parseOptionsId(input as any).typeId).toBe('TypeBox');
		});
	});
});
