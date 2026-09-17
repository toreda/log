/**
 * String key for each built-in log level bitmask. Accepted anywhere a
 * level bitmask is, so `log.disableGlobalLevel('trace')` is equivalent
 * to `log.disableGlobalLevel(Levels.TRACE)`.
 *
 * @category Log Level
 */
export type LevelKey =
	'none' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'all' | 'all_custom' | 'all_extended';
