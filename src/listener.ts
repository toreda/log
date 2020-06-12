import { ArmorLogEvent } from './event';
import { ArmorLogProcessor } from './processor';
export class ArmorLogListener {
	public readonly processor: ArmorLogProcessor;
	public readonly id: number;

	constructor(id: number, processor: ArmorLogProcessor) {
		this.id = id;
		this.processor = processor;
	}

	public canProcessEvent(event: ArmorLogEvent): boolean {
		if (!this.processor) {
			return false;
		}

		return false;
	}

	public process(event: ArmorLogEvent): void {

	}
}