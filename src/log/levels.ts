/** Supported log levels and associated ID (and bitmask). */
export enum LogLevels {
	NONE = 0x0,
	ERROR = 0x1,
	WARN = 0x2,
	INFO = 0x4,
	DEBUG = 0x8,
	TRACE = 0x10,
	ALL = 0x1f
}
