/**
 * Reason an addTransport call did not add a transport.
 *
 * - `transport_missing`: transport arg was null or undefined.
 * - `transport_duplicate`: a transport with the same identity or id
 *   is already attached to this log group.
 * - `transport_init_failed`: transport could not be constructed from
 *   the provided args. The thrown error is included in `errors`.
 *
 * @category Transports
 */
export type TransportAddErrorCode = 'transport_missing' | 'transport_duplicate' | 'transport_init_failed';
