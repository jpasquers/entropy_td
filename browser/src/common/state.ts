export abstract class State<Props> {
    transitionTo<NextStateProps>(nextState: State<NextStateProps>, props: NextStateProps): void {
        this.onLeaveState();
        nextState.onEnterState(props);
    }

    abstract onEnterState(meta: Props): void;

    abstract onLeaveState(): void;
}

export type StateMap<StateType> = Record<number, StateType>;