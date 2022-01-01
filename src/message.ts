/**
 * Data structure provided to action execution for
 * each log message matching its transport log level.
 */
export interface Message {
	/** UTC Timestamp when log message was originally created. */
	date: number;
	level: number;
	message: string;
	path: string[];
}
