import {LogMessage} from './log-message';

export type LogTransportAction = (logMessage: LogMessage) => Promise<any>;
