/**
 * Bitmasks for each log level.
 */
export enum Levels {
	/**
	 * Empty bitmask to disable all levels.
	 *
	 * `&` BITWISE AND 	- 	Disable all levels.
	 *
	 * `|` BITWISE OR 	- 	No effect.
	 */
	NONE = 0b0000_0000,

	/**
	 * Bitmask for Error log level.
	 *
	 * `&` BITWISE AND	- 	Disable all levels except error.
	 *
	 * `|` BITWISE OR	-	Enable error level without changing other
	 * 						active levels.
	 */
	ERROR = 0b0000_0001,

	/**
	 * Bitmask for Warn log level.
	 *
	 * `&` BITWISE AND 	- 	Disable all levels except warn.
	 *
	 * `|` BITWISE OR 	-	Enable warn level without changing other
	 * 						active levels.
	 */
	WARN = 0b0000_0010,

	/**
	 * Bitmask for Info log level.
	 *
	 * `&` BITWISE AND 	- 	Disable all levels except info.
	 *
	 * `|` BITWISE OR 	-	Enable info level without changing other
	 * 						active levels.
	 */
	INFO = 0b0000_0100,

	/**
	 * Bitmask for Debug log level.
	 *
	 * `&` BITWISE AND 	- 	Disable all levels except debug.
	 *
	 * `|` BITWISE OR 	-	Enable debug level without changing other
	 * 						active levels.
	 */
	DEBUG = 0b0000_1000,

	/**
	 * Bitmask for Trace log level.
	 *
	 * `&` BITWISE AND 	- 	Disable all levels except trace.
	 *
	 * `|` BITWISE OR 	-	Enable trace level without changing other
	 * 						active levels.
	 */
	TRACE = 0b0001_0000,

	/**
	 * Bitmask for all built-in log levels.
	 *
	 * `&` BITWISE AND 	- 	Enable all built-in log levels and disable
	 * 					all custom log levels.
	 *
	 * `|` BITWISE OR 	-	Enable all built-in log levels without
	 * 						affecting custom log levels.
	 */
	ALL = 0b1111_1111,

	/**
	 * Bitmask for all custom log levels.
	 *
	 * `&` BITWISE AND 	- 	Enable all custom levels and disable
	 * 						all built-in log levels.
	 *
	 * `|` BITWISE OR 	-	Enable all custom log levels without affecting
	 * 						built-in log levels.
	 */
	ALL_CUSTOM = 0b1_1111_1111_1111_1111_1111_1111_1111_1111_1111_1111_1111_0000_0000,

	/**
	 * Bitmask for all log levels.
	 *
	 * `&` BITWISE AND 	- 	Enable all built-in and all custom log levels.
	 *
	 * `|` BITWISE OR 	-	Enable all built-in and all custom log levels.
	 */
	ALL_EXTENDED = 0b1_1111_1111_1111_1111_1111_1111_1111_1111_1111_1111_1111_1111_1111
}
