import {Message} from '../message';

/**
 * Custom Action used to create a log transport.
 * Executed by transport once for each received
 * msg matching transport log level.
 *
 * Must return `true` (or a promise resolving to `true`) on success.
 * Any other value, including `undefined` from a void function,
 * is reported as a failure in the log result.
 *
 * @category Transports
 */
export type TransportAction = (logMessage: Message) => boolean | Promise<boolean>;
