import type {TransportAddErrorCode} from './error/code';

/**
 * Result returned by addTransport describing whether the transport
 * was attached and, if not, why.
 *
 * @category Transports
 */
export interface TransportAddResult {
	/** True when transport was attached to the log group. */
	ok: boolean;
	/** Failure reason. Null or absent when ok is true. */
	errorCode?: TransportAddErrorCode | null;
	/** Exceptions caught while attempting to add the transport. */
	errors?: unknown[];
}
