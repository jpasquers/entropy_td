import { BasicScene } from "../scenes";
import { ClickObserver, KeyDownObserver, MouseMovementObserver } from "./publishers/input";

export abstract class State<Scene extends BasicScene, Props> {
    scene: Scene;
    constructor(scene: Scene) {
        this.scene = scene;
    }

    addToKeyTracker(obs: KeyDownObserver) {
        this.scene.keyTracker?.addObserver(obs);
    }

    addToClickTracker(obs: ClickObserver) {
        this.scene.clickTracker?.addObserver(obs);
    }

    addToMouseTracker(obs: MouseMovementObserver) {
        this.scene.mouseMovementTracker?.addObserver(obs);
    }

    removeFromKeyTracker(obs: KeyDownObserver) {
        this.scene.keyTracker?.remove(obs);
    }

    removeFromClickTracker(obs: ClickObserver) {
        this.scene.clickTracker?.remove(obs);
    }

    removeFromMouseTracker(obs: MouseMovementObserver) {
        this.scene.mouseMovementTracker?.remove(obs);
    }

    transitionTo<NextStateProps>(nextState: State<Scene,NextStateProps>, props: NextStateProps): void {
        this.onLeaveState();
        nextState.onEnterState(props);
    }

    abstract onEnterState(meta: Props): void;

    abstract onLeaveState(): void;
}

export type StateMap<StateType> = Record<number, StateType>;