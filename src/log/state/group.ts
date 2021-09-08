import {Defaults} from '../../defaults';
import {Levels} from '../../levels';
import type {Log} from '../../log';
import {LogLevel} from '../level';
import type {LogOptionsGroup} from '../options';
import type {Transport} from '../../transport';
import {validId} from '../../valid/id';
import {validLevel} from '../../valid/level';

type KeysExludedFromOptions = 'state';
type Options = Omit<LogOptionsGroup, KeysExludedFromOptions>;
type KeysExludedFromState = KeysExludedFromOptions | 'parent';

export class LogStateGroup {
	public readonly id: string;
	public enabled: boolean;
	public level: LogLevel;
	public parent: Log | null;
	public readonly path: string[];

	public readonly transports: Set<Transport>;

	constructor(options: Options) {
		this.id = validId(options.id) ? options.id : Defaults.GroupId;
		this.enabled = options.enabled === true ? true : false;
		const logLevel = validLevel(options.level) ? options.level : Levels.ERROR;
		this.level = new LogLevel(logLevel);
		this.parent = options.parent ?? null;
		this.path = options.path ?? [];

		this.transports = new Set();
	}
}
