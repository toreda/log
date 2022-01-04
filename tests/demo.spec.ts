import {Log} from '../src/log';
import {Transport} from '../src/transport';
import {TransportAction} from '../src/transport/action';

const action: TransportAction = function (_logData) {
	// console.log(`${this.id}: ${_logData.message}`);
	logResult[this.id] = true;
	return true;
};
const topTransport = new Transport('top', 0xffff, action);
const subTransport = new Transport('sub', 0xffff, action);
const logResult = {top: false, sub: false};

describe(`Demo for bubbling events interactions with enable/disable.`, () => {
	const topLog = new Log({id: 'top', groupsStartEnabled: false});
	const subLog = topLog.makeLog('sub');
	topLog.addTransport(topTransport);
	subLog.addTransport(subTransport);

	beforeEach(() => {
		logResult.top = false;
		logResult.sub = false;
	});

	it(`both disabled & call topLog = {top: false, sub: false}.`, async () => {
		topLog.disable();
		subLog.disable();

		await topLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(false);
		expect(logResult.sub).toBe(false);
	});

	it(`both disabled & call subLog = {top: false, sub: false}.`, async () => {
		topLog.disable();
		subLog.disable();

		await subLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(false);
		expect(logResult.sub).toBe(false);
	});

	it(`only topLog enabled & call topLog = {top: true, sub: false}.`, async () => {
		topLog.enable();
		subLog.disable();

		await topLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(true);
		expect(logResult.sub).toBe(false);
	});

	it(`only topLog enabled & call subLog = {top: true, sub: false}.`, async () => {
		topLog.enable();
		subLog.disable();

		await subLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(true);
		expect(logResult.sub).toBe(false);
	});

	it(`only subLog enabled & call topLog = {top: false, sub: false}.`, async () => {
		topLog.disable();
		subLog.enable();

		await topLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(false);
		expect(logResult.sub).toBe(false);
	});

	it(`only subLog enabled & call subLog = {top: false, sub: true}.`, async () => {
		topLog.disable();
		subLog.enable();

		await subLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(false);
		expect(logResult.sub).toBe(true);
	});

	it(`both enabled & call topLog = {top: true, sub: false}.`, async () => {
		topLog.enable();
		subLog.enable();

		await topLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(true);
		expect(logResult.sub).toBe(false);
	});

	it(`both enabled & call subLog = {top: true, sub: true}.`, async () => {
		topLog.enable();
		subLog.enable();

		await subLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(true);
		expect(logResult.sub).toBe(true);
	});
});

describe(`Demo for bubbling events interactions with levels.`, () => {
	const topLog = new Log({id: 'top', groupsStartEnabled: true, globalLevel: 0});
	const subLog = topLog.makeLog('sub');
	topLog.addTransport(topTransport);
	subLog.addTransport(subTransport);

	beforeEach(() => {
		logResult.top = false;
		logResult.sub = false;
	});

	it(`both mismatch & call topLog = {top: false, sub: false}.`, async () => {
		topLog.setGroupLevel(0);
		subLog.setGroupLevel(0);

		await topLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(false);
		expect(logResult.sub).toBe(false);
	});

	it(`both mismatch & call subLog = {top: false, sub: false}.`, async () => {
		topLog.setGroupLevel(0);
		subLog.setGroupLevel(0);

		await subLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(false);
		expect(logResult.sub).toBe(false);
	});

	it(`only topLog matches & call topLog = {top: true, sub: false}.`, async () => {
		topLog.setGroupLevel(0b100);
		subLog.setGroupLevel(0);

		await topLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(true);
		expect(logResult.sub).toBe(false);
	});

	it(`only topLog matches & call subLog = {top: true, sub: false}.`, async () => {
		topLog.setGroupLevel(0b100);
		subLog.setGroupLevel(0);

		await subLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(true);
		expect(logResult.sub).toBe(false);
	});

	it(`only subLog matches & call topLog = {top: false, sub: false}.`, async () => {
		topLog.setGroupLevel(0);
		subLog.setGroupLevel(0b100);

		await topLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(false);
		expect(logResult.sub).toBe(false);
	});

	it(`only subLog matches & call subLog = {top: false, sub: true}.`, async () => {
		topLog.setGroupLevel(0);
		subLog.setGroupLevel(0b100);

		await subLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(false);
		expect(logResult.sub).toBe(true);
	});

	it(`both match & call topLog = {top: true, sub: false}.`, async () => {
		topLog.setGroupLevel(0b100);
		subLog.setGroupLevel(0b100);

		await topLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(true);
		expect(logResult.sub).toBe(false);
	});

	it(`both match & call subLog = {top: true, sub: true}.`, async () => {
		topLog.setGroupLevel(0b100);
		subLog.setGroupLevel(0b100);

		await subLog.info(expect.getState().currentTestName.split('. ')[1]);

		expect(logResult.top).toBe(true);
		expect(logResult.sub).toBe(true);
	});
});
