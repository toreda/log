import { ArmorLogListener } from './listener';

export class ArmorLogGroup {
	public readonly id: string;
	public readonly listeners: ArmorLogListener[];

	constructor(id: string) {
		this.id = id;
		this.listeners = [];
	}

	public add(listener: ArmorLogListener): boolean {
		const initialCount = this.listeners.length;
		this.listeners.push(listener);
		return this.listeners.length > initialCount;
	}
}