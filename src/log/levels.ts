/**
 * Bitmasks for each log level.
 */
export enum LogLevels {
	/**
	 * Empty bitmask to disable all levels.
	 * BITWISE AND 	- 	Disable all levels.
	 * BITWISE OR 	- 	No effect.
	 */
	NONE = 0x0,
	/**
	 * Bitmask for Error log level.
	 * BITWISE AND 	- 	Disable all levels except error.
	 * BITWISE OR 	-	Enable error level without changing other
	 * 					active levels.
	 */
	ERROR = 0x1,
	/**
	 * Bitmask for Warn log level.
	 * BITWISE AND 	- 	Disable all levels except warn.
	 * BITWISE OR 	-	Enable warn level without changing other
	 * 					active levels.
	 */
	WARN = 0x2,
	/**
	 * Bitmask for Info log level.
	 * BITWISE AND 	- 	Disable all levels except info.
	 * BITWISE OR 	-	Enable info level without changing other
	 * 					active levels.
	 */
	INFO = 0x4,
	/**
	 * Bitmask for Debug log level.
	 * BITWISE AND 	- 	Disable all levels except debug.
	 * BITWISE OR 	-	Enable debug level without changing other
	 * 					active levels.
	 */
	DEBUG = 0x8,
	/**
	 * Bitmask for Trace log level.
	 * BITWISE AND 	- 	Disable all levels except trace.
	 * BITWISE OR 	-	Enable trace level without changing other
	 * 					active levels.
	 */
	TRACE = 0x10,
	/**
	 * Bitmask for all built-in log levels.
	 * BITWISE AND 	- 	Enable all built-in log levels and disable
	 * 					all custom log levels.
	 * BITWISE OR 	-	Enable all built-in log levels without
	 * 					affecting custom log levels.
	 */
	ALL = 0xff,
	/**
	 * Bitmask for all custom log levels.
	 * BITWISE AND 	- 	Enable all custom levels and disable
	 * 					all built-in log levels.
	 * BITWISE OR 	-	Enable all custom log levels without affecting
	 * 					built-in log levels.
	 */
	ALL_CUSTOM = 0xffffffffffffff00,
	/**
	 * Bitmask for all log levels.
	 * BITWISE AND 	- 	Enable all built-in and all custom log levels.
	 * BITWISE OR 	-	Enable all built-in and custom log levels.
	 */
	ALL_EXTENDED = 0xffffffffffffffff
}
