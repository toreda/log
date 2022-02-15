import {Defaults} from '../../defaults';
import {Levels} from '../../levels';
import {Log} from '../../log';
import {LogLevel} from '../level';
import {LogOptionsGroup} from '../options/group';
import {Transport} from '../../transport';
import {checkId} from '../../check/id';
import {checkLevel} from '../../check/level';

/**
 * @category State
 */
export class LogStateGroup {
	public readonly id: string;
	public enabled: boolean;
	public level: LogLevel;
	public parent: Log | null;
	public readonly path: string[];

	public readonly transports: Set<Transport>;

	constructor(options: Omit<LogOptionsGroup, 'state'>) {
		this.id = checkId(options.id) ? options.id : Defaults.GroupId;
		this.enabled = options.enabled === true ? true : false;
		const logLevel = checkLevel(options.level) ? options.level : Levels.ERROR;
		this.level = new LogLevel(logLevel);
		this.parent = options.parent ?? null;
		this.path = options.path ?? [];

		this.transports = new Set();
	}
}
