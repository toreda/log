import {LogLevels} from '../levels';
import {LogTransport} from '../transport';

export interface LogGroupLevels {
	[LogLevels.ERROR]?: LogTransport[];
	[LogLevels.WARN]?: LogTransport[];
	[LogLevels.INFO]?: LogTransport[];
	[LogLevels.TRACE]?: LogTransport[];
	[LogLevels.DEBUG]?: LogTransport[];
}
