import type {Log} from '../../log';
import type {LogStateGlobal} from '../state/global';

/**
 * Used by makeGroup in a existing Log
 *
 * @category Options
 */
export interface LogOptionsGroup {
	state: LogStateGlobal;

	id: string;
	parent?: Log;
	path?: string[];

	enabled?: boolean;
	level?: number;
}
