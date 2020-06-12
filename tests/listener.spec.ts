import {ArmorLogListener} from '../src/listener';
import {ArmorLogProcessor} from '../src/processor';

const MOCK_ID = 111;
const MOCK_PROCESSOR: ArmorLogProcessor = {};

describe('ArmorLogListener', () => {
	let instance: ArmorLogListener;

	beforeAll(() => {
		instance = new ArmorLogListener(MOCK_ID, MOCK_PROCESSOR);
	});

	describe('Constructor', () => {
		it('should set id property to the provided id argument', () => {
			const expectedId = 10941;
			const customInstance = new ArmorLogListener(expectedId, MOCK_PROCESSOR);
			expect(customInstance.id).toBe(expectedId);
		});

		it('should set processor property to the provided processor argument', () => {
			const expectedResult: ArmorLogProcessor = {};
			const customInstance = new ArmorLogListener(MOCK_ID, expectedResult);
			expect(customInstance.processor).toBe(expectedResult);
		});
	});

	describe("Implementation", () => {
		describe("process", () => {

		});

		describe("canProcessEvent", () => {
			it('should return false when processor property is missing', () => {

			});
		});
	});
});
