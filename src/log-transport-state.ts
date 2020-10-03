import {LogMessage} from './log-message';
import {TBString} from '@toreda/type-box';

export interface LogTransportState {
	id: TBString;
	logs: LogMessage[];
}
