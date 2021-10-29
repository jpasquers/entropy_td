import { GameOrchestrator, GameState } from "entropy-td-core/lib/orchestrator";
import { Observer, Publisher } from "../../common/publishers";
import { FrameDeltaEvent, FrameDeltaObserver } from "../../common/publishers/frame_delta";

export type GameStateObserver = Observer<GameState>;

export class GameStatePublisher extends Publisher<GameState> implements FrameDeltaObserver {
    id: string;
    gameOrchestrator: GameOrchestrator;

    constructor(gameOrchestrator: GameOrchestrator) {
        super();
        this.id = "game_state_publisher";
        this.gameOrchestrator = gameOrchestrator;
    }

    public onEvent(event: FrameDeltaEvent): void {
        let state = this.gameOrchestrator.nextFrame(event.delta);
        this.publishEvent(state);
    }
    
}