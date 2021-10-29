import Phaser, { Scene } from "phaser";
import { GameOrchestrator } from "entropy-td-core";
import { TerrainRenderer, TowerRenderer } from "./renderers/board";
import { CreepRenderer } from "./renderers/creep";
import { ProjectileRenderer } from "./renderers/projectile";
import { CommandCardRenderer, COMMAND_CARD_WIDTH } from "./renderers/command_card";
import { SceneGridRenderer } from "./renderers/scene_grid";
import { CommandCard, TowerListCommandCard } from "./command_card";
import { ActionError } from "entropy-td-core/lib/actions/action_handler";
import { ErrorRenderer } from "./renderers/error";
import { ActiveGameSceneGrid } from "./scene_grid";
import { GameStatePublisher } from "./gamestate_publisher";
import { BasicScene } from "..";
import { TowerSilhoutteRenderer } from "./renderers/tower_silhoutte";
import { getActiveGameStartingState } from "./states";
import { MoneyRenderer, TimeRenderer } from "./renderers/timer";
import { PathRenderer } from "./renderers/path";

export class ActiveGameScene extends BasicScene {
    gameController: GameOrchestrator
    sceneGrid: ActiveGameSceneGrid;
    terrainRenderer: TerrainRenderer;
    towerRenderer: TowerRenderer;
    creepRenderer: CreepRenderer;
    projectileRenderer: ProjectileRenderer;
    commandCardRenderer: CommandCardRenderer;
    sceneGridRenderer: SceneGridRenderer;
    timeRenderer: TimeRenderer;
    moneyRenderer: MoneyRenderer;
    pathRenderer: PathRenderer;
    frameCount: number;
    currentError?: ActionError;
    errorRenderer: ErrorRenderer;
    gameStatePublisher: GameStatePublisher;

    constructor(gameController: GameOrchestrator) {
        super();
        this.frameCount = 0;
        this.gameController = gameController;
        this.sceneGrid = new ActiveGameSceneGrid(this);
        this.gameStatePublisher = new GameStatePublisher(this.gameController);
        this.frameDeltaPublisher.addObserver(this.gameStatePublisher);
        
        this.terrainRenderer = new TerrainRenderer(this.sceneGrid.gameplaySection, this.gameController.config.tilePixelDim);
        
        this.towerRenderer = new TowerRenderer(this.sceneGrid.gameplaySection, this.gameController.config.tilePixelDim);
        this.creepRenderer = new CreepRenderer(this.sceneGrid.gameplaySection);
        this.projectileRenderer = new ProjectileRenderer(this.sceneGrid.gameplaySection);
        this.commandCardRenderer = new CommandCardRenderer(this.sceneGrid.commandCardSection);
        this.sceneGridRenderer = new SceneGridRenderer(this);
        this.errorRenderer = new ErrorRenderer(this.sceneGrid.gameplaySection);
        this.timeRenderer = new TimeRenderer(this.sceneGrid.navigationSection);
        this.moneyRenderer = new MoneyRenderer(this.sceneGrid.navigationSection);
        this.pathRenderer = new PathRenderer(this.sceneGrid.gameplaySection);

        this.gameStatePublisher.addObservers(
            this.towerRenderer,
            this.creepRenderer,
            this.projectileRenderer,
            this.timeRenderer,
            this.moneyRenderer,
            this.pathRenderer
        )
    }

    public preload() {
        this.load.image('start', '/assets/start.jpeg');
        this.load.image('checkpoint_1', '/assets/checkpoint_1.png');
        this.load.image('checkpoint_2', '/assets/checkpoint_2.png');
        this.load.image('checkpoint_3', '/assets/checkpoint_3.png');
        this.load.image('finish', '/assets/finish.jpeg');
        this.load.image('rock', '/assets/rock.jpeg');
        this.load.image('empty', '/assets/empty.jpeg');
        this.load.spritesheet("tower_simple_1", "/assets/tower_simple_1.png", {
            frameWidth: 200,
            frameHeight: 200
        });
        //this.load.image('tower_simple_1_card', '/assets/tower_simple_1.png');
        this.load.image('space_background','/assets/Starfield-13.jpg');
    }

    public create() {
        super.create();
        this.terrainRenderer.renderBackgroundTerrain();
        this.terrainRenderer.synchronizeItems(this.gameController.getBoard());
        this.sceneGridRenderer.synchronizeItems(...this.sceneGrid.getSections());
        getActiveGameStartingState(this).onEnterState();
    }

    handleActionError(e: ActionError): void {
        this.errorRenderer.renderError(e);
    }
}