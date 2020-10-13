import {LogTransportState} from '../src/log-transport-state';

describe('LogTransportState', () => {
	let instance: LogTransportState;

	beforeAll(() => {
		instance = new LogTransportState();
	});
	describe('constructor', () => {
		it('should call parse with options', () => {
			let spy = jest.spyOn(LogTransportState.prototype, 'parse');
			const expectedV = {
				id: 'TestId928'
			};
			new LogTransportState(expectedV);
			expect(spy).toBeCalledWith(expectedV);
		});
	});

	describe('randomId', () => {
		it('should return a string of length 9', () => {
			let result = instance.randomId();
			expect(typeof result).toBe('string');
			expect(result.length).toBe(9);
		});
	});
});
