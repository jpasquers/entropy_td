import { ActionError, GameOrchestrator } from "entropy-td-core";
import { BasicScene } from "..";
import { GameStatePublisher } from "../active_game/gamestate_publisher";
import { BorderedSubSceneRenderer } from "../active_game/renderers/scene_grid";
import { ActiveGameHudGrid } from "../active_game/scene_grid";

export class HudScene extends BasicScene {
    
    gameStatePublisher: GameStatePublisher;
    gameController: GameOrchestrator;
    hudGrid?: ActiveGameHudGrid;
    sceneGridRenderer?: BorderedSubSceneRenderer;

    constructor(gameController: GameOrchestrator) {
        super("active_game_hud");
        this.frameCount = 0;
        this.gameController = gameController;
        this.gameStatePublisher = new GameStatePublisher(this.gameController);
        this.frameDeltaPublisher.addObserver(this.gameStatePublisher);
    }


    public create() {
        super.create();
        this.mainCameraAdapter?.resizeToWindow();
        this.hudGrid = new ActiveGameHudGrid(this);
        this.sceneGridRenderer = new BorderedSubSceneRenderer(this);
        this.sceneGridRenderer.synchronizeItems(...this.hudGrid.getBorderedSections());

    }

    handleActionError(e: ActionError): void {
        throw new Error("Method not implemented.");
    }
}