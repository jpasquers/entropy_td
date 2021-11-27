import { GameOrchestrator, GameState } from "entropy-td-core/lib/orchestrator";
import { Observer, Publisher } from "../../common/publishers";
import { FrameDeltaEvent, FrameDeltaObserver } from "../../common/publishers/frame_delta";

export type GameStateObserver = Observer<GameState>;

//TODO there's a fundamental problem of when do i update the actual game.
//When the game relies on multiple seemingly frame independent items.
export class GameStatePublisher extends Publisher<GameState> {
    id: string;
    gameOrchestrator: GameOrchestrator;

    constructor(gameOrchestrator: GameOrchestrator) {
        super();
        this.id = "game_state_publisher";
        this.gameOrchestrator = gameOrchestrator;
    }
    
}

export class GameStateSceneBridge extends Phaser.Scene {
    gameController: GameOrchestrator;
    publisher: GameStatePublisher;
    prevTime: number;
    constructor(gameController: GameOrchestrator) {
        super("game_state_bridge");
        this.gameController = gameController;
        this.publisher = new GameStatePublisher(gameController);
        this.prevTime = 0;
    }

    getPublisher(): GameStatePublisher {
        return this.publisher;
    }

    update(time: number, delta: number) {
        let rawDelta = time - this.prevTime;
        this.prevTime = time;
        let state = this.gameController.nextFrame(rawDelta);
        this.publisher.publishEvent(state);
    }
}