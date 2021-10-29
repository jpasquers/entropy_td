import { GameState } from "entropy-td-core/lib/orchestrator";
import { GameObjectLike, ObjectRendererWithSync, RendererConfig, WithIdentifier } from "../../../common/renderer";
import { DisplayContext } from "../../../phaser/extensions/display_context";
import { GameStateObserver } from "../gamestate_publisher";

export abstract class GameStateObjectRenderer<Model extends WithIdentifier, PhaserObj extends GameObjectLike>
    extends ObjectRendererWithSync<Model,PhaserObj> implements GameStateObserver {
    id: string;

    constructor(config: RendererConfig,displayContext: DisplayContext, id: string) {
        super(config, displayContext);
        this.id = id;
    }

    abstract getModels(gameState: GameState): Model[];

    onEvent(event: GameState): void {
        this.synchronizeItems(...this.getModels(event));
    }

}