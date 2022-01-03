import { GameOrchestrator, GameState } from "entropy-td-core/lib/orchestrator";
import { Observer, Publisher, PublisherWithReference } from "../../common/publishers";
import { FrameDeltaEvent, FrameDeltaObserver } from "../../common/publishers/frame_delta";

export type GameStateObserver = Observer<GameState>;

export class GameStatePublisher extends PublisherWithReference<GameState> {
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