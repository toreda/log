import {LogMessage} from '../message';

export type LogTransportAction = (logMessage: LogMessage) => Promise<any>;
