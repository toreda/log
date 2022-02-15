import {Message} from '../message';

/**
 * Custom Action used to create a log transport.
 * Executed by transport once for each received
 * msg matching transport log level.
 *
 * @category Transports
 */
export type TransportAction = (logMessage: Message) => boolean | Promise<boolean>;
