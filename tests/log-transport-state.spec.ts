import {LogTransportState} from '../src/log-transport-state';

describe('LogTransportState', () => {
	let instance: LogTransportState;

	beforeAll(() => {
		instance = new LogTransportState();
	});
	describe('constructor', () => {
		it('should call parseOptionsId with options', () => {
			let spy = jest.spyOn(LogTransportState.prototype, 'parseOptionsId');
			const expectedV = {
				id: 'TestId928'
			};
			new LogTransportState(expectedV);
			expect(spy).toBeCalledWith(expectedV);
		});
	});

	describe('parseOptionsId', () => {
		it.each([undefined, 8524, '', 'random string 2'])('should return a TBString: %p', (input) => {
			expect(instance.parseOptionsId(input as any).typeId).toBe('TypeBox');
		});
	});
});
