import {LogMessage} from './log-message';
import {LogTransportAction} from './log-transport-action';
import {TBString} from '@toreda/type-box';

export interface LogTransportState {
	readonly execute: LogTransportAction;
	readonly id: TBString;
	logs: LogMessage[];
}
