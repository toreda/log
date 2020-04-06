import { ArmorLogProcessor } from './processor';
export class ArmorLogListener {
	public readonly processor: ArmorLogProcessor;
	public readonly id: number;

	constructor(id: number, processor: ArmorLogProcessor) {
		this.id = id;
		this.processor = processor;
	}
}