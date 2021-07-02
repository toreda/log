import {
	RecordToStrong,
	StrongBoolean,
	StrongMap,
	StrongString,
	makeBoolean,
	makeString
} from '@toreda/strong-types';
import {Levels} from '../../levels';
import {StrongLevel, makeLevel} from '../../strong-level';
import {Transport} from '../../transport';
import {LogOptionsGroup} from '../options';

type Options = Omit<LogOptionsGroup, 'state'>;
type State = RecordToStrong<Omit<LogOptionsGroup, 'state'>>;

export class LogStateGroup extends StrongMap implements State {
	public readonly id: StrongString;
	public readonly enabled: StrongBoolean;
	public readonly level: StrongLevel;
	public readonly path: string[];

	public readonly transports: Set<Transport>;

	constructor(options: Options) {
		super();

		this.id = makeString('');
		this.enabled = makeBoolean(false);
		this.level = makeLevel(Levels.ERROR);
		this.path = options.path ?? [];

		this.parse(options);

		this.transports = new Set();
	}
}
