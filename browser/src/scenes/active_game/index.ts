import Phaser, { Scene } from "phaser";
import { GameOrchestrator } from "entropy-td-core";
import { TerrainRenderer, TowerRenderer } from "./renderers/board";
import { CreepRenderer } from "./renderers/creep";
import { ProjectileRenderer } from "./renderers/projectile";
import { CommandCardRenderer } from "./renderers/command_card";
import { BorderedSubSceneRenderer } from "./renderers/scene_grid";
import { CommandCard, TowerListCommandCard } from "./command_card";
import { ActionError } from "entropy-td-core";
import { ErrorRenderer } from "./renderers/error";
import { ActiveGameSceneGrid, getInternalGameplayHeight, getInternalGameplayWidth } from "./scene_grid";
import { GameStatePublisher } from "./gamestate_publisher";
import { BasicScene } from "..";
import { TowerSilhoutteRenderer } from "./renderers/tower_silhoutte";
import { getActiveGameStartingState } from "./states";
import { MoneyRenderer, TimeRenderer } from "./renderers/timer";
import { PathRenderer } from "./renderers/path";
import { TOWER_SHOOT_ANIM_FRAMES } from "../../display_configs";
import { ifNegativeZero } from "../../common/util";
import { MouseMovement } from "../../common/publishers/input";
import { FrameRateRenderer } from "./renderers/frame_rate";


export class ActiveGameScene extends BasicScene {
    gameController: GameOrchestrator
    sceneGrid?: ActiveGameSceneGrid;
    terrainRenderer?: TerrainRenderer;
    towerRenderer?: TowerRenderer;
    creepRenderer?: CreepRenderer;
    projectileRenderer?: ProjectileRenderer;
    commandCardRenderer?: CommandCardRenderer;
    sceneGridRenderer?: BorderedSubSceneRenderer;
    timeRenderer?: TimeRenderer;
    moneyRenderer?: MoneyRenderer;
    pathRenderer?: PathRenderer;
    frameRateRenderer?: FrameRateRenderer;

    frameCount: number;
    currentError?: ActionError;
    errorRenderer?: ErrorRenderer;
    gameStatePublisher: GameStatePublisher;

    constructor(gameController: GameOrchestrator) {
        super();
        this.frameCount = 0;
        this.gameController = gameController;
        this.gameStatePublisher = new GameStatePublisher(this.gameController);
        this.frameDeltaPublisher.addObserver(this.gameStatePublisher);
    }

    public preload() {
        this.load.image('start', '/assets/start.jpeg');
        this.load.image('checkpoint_1', '/assets/checkpoint_1.png');
        this.load.image('checkpoint_2', '/assets/checkpoint_2.png');
        this.load.image('checkpoint_3', '/assets/checkpoint_3.png');
        this.load.image('finish', '/assets/finish.jpeg');
        this.load.image('rock', '/assets/rock.jpeg');
        this.load.image('empty', '/assets/empty.jpeg');
        this.load.atlas("tower_simple_1", "/assets/tower_simple_1.png", "/assets/tower_simple_1.json");
        this.load.atlas("tower_simple_1_command_card", "/assets/tower_simple_1_command_card.png", "/assets/tower_simple_1_command_card.json");
        //this.load.image('tower_simple_1_card', '/assets/tower_simple_1.png');
        this.load.image('space_background','/assets/Starfield-13.jpg');

    }


    public create() {
        super.create();
        this.mainCameraAdapter?.resizeToWindow();
        this.mainCameraAdapter?.centerWithin(
            getInternalGameplayWidth(this.gameController.config), 
            getInternalGameplayHeight(this.gameController.config)
        );
        this.mainCameraAdapter?.enableCameraDrag(this.mouseMovementTracker!);
        this.mainCameraAdapter?.enableZoom(this.mouseScrollTracker!);
        
        this.sceneGrid = new ActiveGameSceneGrid(this);
        this.terrainRenderer = new TerrainRenderer(this.sceneGrid.gameplaySection, this.gameController.config.tilePixelDim);
        
        this.towerRenderer = new TowerRenderer(this.sceneGrid.gameplaySection, this.gameController.config.tilePixelDim);
        this.creepRenderer = new CreepRenderer(this.sceneGrid.gameplaySection);
        this.projectileRenderer = new ProjectileRenderer(this.sceneGrid.gameplaySection);
        this.commandCardRenderer = new CommandCardRenderer(this.sceneGrid.commandCardSection);
        this.sceneGridRenderer = new BorderedSubSceneRenderer(this);
        this.errorRenderer = new ErrorRenderer(this.sceneGrid.notificationSection);
        this.timeRenderer = new TimeRenderer(this.sceneGrid.navigationSection);
        this.moneyRenderer = new MoneyRenderer(this.sceneGrid.navigationSection);
        this.pathRenderer = new PathRenderer(this.sceneGrid.gameplaySection);
        this.frameRateRenderer = new FrameRateRenderer(this.sceneGrid.navigationSection);

        this.frameDeltaPublisher.addObserver(this.frameRateRenderer);
        this.gameStatePublisher.addObservers(
            this.towerRenderer,
            this.creepRenderer,
            this.projectileRenderer,
            this.timeRenderer,
            this.moneyRenderer,
            this.pathRenderer
        )
        this.terrainRenderer.renderBackgroundTerrain();
        this.terrainRenderer.synchronizeItems(this.gameController.getBoard());
        this.sceneGridRenderer.synchronizeItems(...this.sceneGrid.getBorderedSections());
        this.anims.create({
            key: 'shoot_tower',
            frames: this.anims.generateFrameNames('tower_simple_1', {
                prefix: 'tower_simple_1 ',
                suffix: '.aseprite',
                start: 0,
                end: TOWER_SHOOT_ANIM_FRAMES-1
            }),
            frameRate: 30,
            repeat: -1
        })
        getActiveGameStartingState(this).onEnterState();
        
    }

    update(time: number, delta: number) {
        super.update(time,delta);
    }

    handleActionError(e: ActionError): void {
        this.errorRenderer?.renderError(e);
    }
}