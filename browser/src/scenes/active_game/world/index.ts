import Phaser, { Scene } from "phaser";
import { GameOrchestrator, TowerType } from "entropy-td-core";
import { CommandCardRenderer } from "../hud/renderers/command_card";
import { CommandCard, TowerListCommandCard } from "../hud/command_card";
import { ActionError } from "entropy-td-core";
import { ActiveGameWorldGrid, getInternalGameplayHeight, getInternalGameplayWidth } from "../scene_grid";
import { GameStatePublisher } from "../gamestate_publisher";
import { BasicScene } from "../..";
import { MoneyRenderer, TimeRenderer } from "../hud/renderers/timer";
import { PathRenderer } from "./renderers/path";
import { TOWER_SHOOT_ANIM_FRAMES } from "../../../display_configs";
import { ifNegativeZero } from "../../../common/util";
import { ClickEvent, ClickObserver, MouseMovement } from "../../../common/publishers/input";
import { FrameRateRenderer } from "../hud/renderers/frame_rate";
import { BorderedSubSceneRenderer } from "./renderers/scene_grid";
import { CreepRenderer } from "./renderers/creep";
import { TerrainRenderer, TowerRenderer } from "./renderers/board";
import { ProjectileRenderer } from "./renderers/projectile";
import { ActiveGameEventListener } from "..";
import { TowerSilhoutteRenderer } from "./renderers/tower_silhoutte";
import { Observer } from "../../../common/publishers";


export class ActiveGameWorldScene extends BasicScene {
    gameController: GameOrchestrator
    worldGrid?: ActiveGameWorldGrid;
    terrainRenderer?: TerrainRenderer;
    towerRenderer?: TowerRenderer;
    creepRenderer?: CreepRenderer;
    projectileRenderer?: ProjectileRenderer;
    commandCardRenderer?: CommandCardRenderer;
    sceneGridRenderer?: BorderedSubSceneRenderer;
    
    pathRenderer?: PathRenderer;
    frameRateRenderer?: FrameRateRenderer;

    frameCount: number;
    currentError?: ActionError;
    gameStatePublisher: GameStatePublisher;
    eventListener: ActiveGameEventListener;
    towerSilhoutteRenderer?: TowerSilhoutteRenderer;
    towerPlacementListener?: ClickObserver;

    constructor(gameController: GameOrchestrator, gameStatePublisher: GameStatePublisher,
        eventListener: ActiveGameEventListener) {
        super("active_game_world");
        this.frameCount = 0;
        this.gameController = gameController;
        this.gameStatePublisher = gameStatePublisher;
        this.eventListener = eventListener;
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
        //this.load.image('tower_simple_1_card', '/assets/tower_simple_1.png');
        this.load.image('space_background','/assets/Starfield-13.jpg');

    }

    listenForTowerPlacementAttempt(towerType: TowerType) {
        this.towerPlacementListener = {
            id: "tower_placement_listener",
            onEvent: (event: ClickEvent) => {
                if (this.terrainRenderer!.isPixelRelated(event.targetWorldPos)) {
                    let coord = this.terrainRenderer!.getTileCoordForRenderedPixel(event.targetWorldPos);
                    this.eventListener.attemptToPlaceTower(towerType, coord);
                }
            }
        }
        this.clickTracker?.addObserver(this.towerPlacementListener);
    }

    enableTowerHover(towerType: TowerType) {
        this.towerSilhoutteRenderer = new TowerSilhoutteRenderer(this);
        this.towerSilhoutteRenderer.enable(towerType);
        this.mouseMovementTracker?.addObserver(this.towerSilhoutteRenderer);
    }

    public towerPreSelect(towerType: TowerType) {
        this.enableTowerHover(towerType);
        this.listenForTowerPlacementAttempt(towerType);
    }

    public towerPlaced() {
        if (this.towerSilhoutteRenderer) {
            this.mouseMovementTracker?.remove(this.towerSilhoutteRenderer);
            this.towerSilhoutteRenderer?.disable();
        }
        if (this.towerPlacementListener) {
            this.clickTracker?.remove(this.towerPlacementListener);
        }
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
        
        this.worldGrid = new ActiveGameWorldGrid(this);
        this.terrainRenderer = new TerrainRenderer(this.worldGrid.gameplaySection, this.gameController.config.tilePixelDim);
        
        this.towerRenderer = new TowerRenderer(this.worldGrid.gameplaySection);
        this.creepRenderer = new CreepRenderer(this.worldGrid.gameplaySection);
        this.projectileRenderer = new ProjectileRenderer(this.worldGrid.gameplaySection);
        this.sceneGridRenderer = new BorderedSubSceneRenderer(this);

        this.pathRenderer = new PathRenderer(this.worldGrid.gameplaySection);

        this.gameStatePublisher.addObservers(
            this.towerRenderer,
            this.creepRenderer,
            this.projectileRenderer,
            this.pathRenderer
        )
        this.terrainRenderer.renderBackgroundTerrain();
        this.terrainRenderer.synchronizeItems(this.gameController.getBoard());
        //this.sceneGridRenderer.synchronizeItems(...this.cameraGrid.getBorderedSections());
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
        
    }

    update(time: number, delta: number) {
        super.update(time,delta);
    }

    handleActionError(e: ActionError): void {
        //NO-op
    }
}