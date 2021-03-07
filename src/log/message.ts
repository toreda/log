/**
 * Data structure provided to action execution for
 * each log message matching its transport log level.
 */
export interface LogMessage {
	/** UTC Timestamp when log message was originally created. */
	date: string;
	level: number;
	message: string;
}
