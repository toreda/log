import {LogMessage} from './log-message';

export interface LogTransportAction {
	(logMessage: LogMessage): Promise<any>;
}
