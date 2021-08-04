import {StrongMap, makeBoolean, makeString} from '@toreda/strong-types';
import type {RecordToStrong, StrongBoolean, StrongString} from '@toreda/strong-types';
import {Levels} from '../../levels';
import type {Log} from '../../log';
import {makeLevel} from '../../strong-level';
import type {StrongLevel} from '../../strong-level';
import type {Transport} from '../../transport';
import type {LogOptionsGroup} from '../options';

type KeysExludedFromOptions = 'state';
type Options = Omit<LogOptionsGroup, KeysExludedFromOptions>;
type KeysExludedFromState = KeysExludedFromOptions | 'parent';
type State = RecordToStrong<Omit<LogOptionsGroup, KeysExludedFromState>>;

export class LogStateGroup extends StrongMap implements State {
	public readonly id: StrongString;
	public readonly enabled: StrongBoolean;
	public readonly level: StrongLevel;
	public readonly parent: Log | null;
	public readonly path: string[];

	public readonly transports: Set<Transport>;

	constructor(options: Options) {
		super();

		this.id = makeString('');
		this.enabled = makeBoolean(false);
		this.level = makeLevel(Levels.ERROR);
		this.parent = options.parent ?? null;
		this.path = options.path ?? [];

		this.parse(options);

		this.transports = new Set();
	}
}
