import { GameState } from "entropy-td-core";
import { WithIdentifier, GameObjectLike, ObjectRendererWithSync, RendererConfig } from "../../../../common/renderer";
import { DisplayContext } from "../../../../phaser/extensions/display_context";
import { GameStateObserver } from "../../gamestate_publisher";


export abstract class GameStateObjectRenderer<Model extends WithIdentifier, PhaserObj extends GameObjectLike>
    extends ObjectRendererWithSync<Model,PhaserObj> implements GameStateObserver {
    id: string;
    mostRecentGameState?: GameState;

    constructor(config: RendererConfig,displayContext: DisplayContext, id: string) {
        super(config, displayContext);
        this.id = id;
    }

    abstract getModels(gameState: GameState): Model[];

    onEvent(event: GameState): void {
        this.mostRecentGameState = event;
        this.synchronizeItems(...this.getModels(event));
    }

}