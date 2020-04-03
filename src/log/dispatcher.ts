import {EventEmitter} from 'events';

export class ArmorLogDispatcher {
	public readonly events: EventEmitter;

	constructor(events: EventEmitter) {
		this.events = events;
	}


}
