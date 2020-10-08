import {LogTransportState} from '../src/log-transport-state';

describe('LogTransportState', () => {
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
});
