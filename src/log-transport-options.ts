import {LogTransportAction} from './log-transport-action';

export interface LogTransportOptions {
	execute?: LogTransportAction;
	id?: string;
}
