import {TBBool, TBString} from '@toreda/type-box';

import {LogTransport} from './log-transport';

export interface LoggerState {
	id: TBString;
	consoleEnabled: TBBool;
	transportNames: {[id: string]: LogTransport};
	transportGroups: {[name: number]: string[]};
}
