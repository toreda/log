import {LogMessage} from '../message';

/**
 * Custom Action used to create a log transport.
 * Executed by transport once for each received
 * msg matching transport log level.
 */
export type LogTransportAction = (logMessage: LogMessage) => Promise<boolean>;
