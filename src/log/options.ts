import type {Expand} from '@toreda/types';
import type {LogOptionsGlobal} from './options/global';
import type {LogOptionsGroup} from './options/group';

/**
 * @category Options
 */
export type LogOptions = Expand<Required<LogOptionsGroup> | LogOptionsGlobal>;
