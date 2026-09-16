import type {LevelKey} from './key';

/**
 * Any value accepted as a log level: a bitmask number or a
 * {@link LevelKey} string that resolves to one.
 *
 * @category Log Level
 */
export type LevelInput = number | LevelKey;
