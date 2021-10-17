import Phaser, { Scene } from "phaser";
import { GameOrchestrator } from "entropy-td-core";
import { TerrainRenderer, TowerRenderer } from "./renderers/board";
import { renderMoney, renderTimer } from "./renderers/timer";
import { renderWalkingPaths } from "./renderers/path";
import { CreepRenderer } from "./renderers/creep";
import { ProjectileRenderer } from "./renderers/projectile";
import { CommandCardRenderer, COMMAND_CARD_WIDTH } from "./renderers/command_card";
import { ActiveGameSceneGrid } from "./scene_grid";
import { SceneGridRenderer } from "./renderers/scene_grid";
import { PlayerEventActionMapper, PlayerEventHandler } from "./events/player_event_handler";
import { CommandCard, TowerListCommandCard } from "./command_card";
import { DigitalInputMapper } from "./events/digital_input_mapper";
import { MouseMovementTracker } from "./events/analog_input_mapper";
import { ActionError } from "entropy-td-core/lib/actions/action_handler";
import { ErrorRenderer } from "./renderers/error";

export class ActiveGameScene extends Phaser.Scene {
    gameController: GameOrchestrator
    sceneGrid: ActiveGameSceneGrid;
    playerEventHandler?: PlayerEventHandler;
    digitalInputMapper?: DigitalInputMapper;
    analogInputMapper?: MouseMovementTracker;
    terrainRenderer: TerrainRenderer;
    towerRenderer: TowerRenderer;
    creepRenderer: CreepRenderer;
    projectileRenderer: ProjectileRenderer;
    commandCardRenderer: CommandCardRenderer;
    sceneGridRenderer: SceneGridRenderer;
    frameCount: number;
    commandCard?: CommandCard;
    currentError?: ActionError;
    errorRenderer: ErrorRenderer;

    constructor(gameController: GameOrchestrator) {
        super({
            active: false,
            visible: false,
            key: 'Primary'
        });
        //temporary
        this.frameCount = 0;
        this.gameController = gameController;
        this.sceneGrid = new ActiveGameSceneGrid(this);

        this.terrainRenderer = new TerrainRenderer(this.sceneGrid.gameplaySection, this.gameController.config.tilePixelDim);
        this.towerRenderer = new TowerRenderer(this.sceneGrid.gameplaySection, this.gameController.config.tilePixelDim);
        this.creepRenderer = new CreepRenderer(this.sceneGrid.gameplaySection);
        this.projectileRenderer = new ProjectileRenderer(this.sceneGrid.gameplaySection);
        this.commandCardRenderer = new CommandCardRenderer(this.sceneGrid.commandCardSection);
        this.sceneGridRenderer = new SceneGridRenderer(this);
        this.errorRenderer = new ErrorRenderer(this.sceneGrid.gameplaySection);
    }

    public preload() {
        this.load.image('start', '/assets/start.jpeg');
        this.load.image('checkpoint_1', '/assets/checkpoint_1.png');
        this.load.image('checkpoint_2', '/assets/checkpoint_2.png');
        this.load.image('checkpoint_3', '/assets/checkpoint_3.png');
        this.load.image('finish', '/assets/finish.jpeg');
        this.load.image('rock', '/assets/rock.jpeg');
        this.load.image('grass', '/assets/grass.jpeg');
        this.load.image('tower_simple_1', '/assets/tower_simple_1.jpeg');
        this.load.image('tower_simple_1_card', '/assets/tower_simple_1.jpeg');
    }

    public create() {
        this.terrainRenderer.renderOne(this.gameController.getBoard());
        this.analogInputMapper = new MouseMovementTracker(this.input);
        this.playerEventHandler = new PlayerEventActionMapper(
            this.gameController, this.terrainRenderer, this.analogInputMapper,
            this.errorRenderer);
        this.commandCard = new TowerListCommandCard(
            this.gameController.getEffectiveTowersList(),
            this.playerEventHandler
        );
        this.digitalInputMapper = new DigitalInputMapper(
            this.input,
            this.terrainRenderer,
            this.playerEventHandler,
            this.commandCard
        )
        this.commandCardRenderer.renderOne(this.commandCard);
        this.sceneGridRenderer.renderAll(this.sceneGrid.getSections());
    }

    public update(time: number, delta: number) {
        this.frameCount++;
        let state = this.gameController.nextFrame(delta);
        this.creepRenderer.renderAll(state.activeCreeps);
        renderTimer(this.sceneGrid.navigationSection, state.timeBeforeWaveSec);
        renderMoney(this.sceneGrid.navigationSection, state.money);
        renderWalkingPaths(this.sceneGrid.gameplaySection,state.optimalPathSegmentsPx);
        this.towerRenderer.renderAll(state.towers);
        this.projectileRenderer.renderAll(state.projectiles);
        this.analogInputMapper?.trackContiguousInput(delta);
    }
}

class PhaserGameDelegate {
    gameView: Phaser.Game;
    gameController: GameOrchestrator
    constructor(gameController: GameOrchestrator) {
        this.gameView = new Phaser.Game({
            input: true,
            scene: new ActiveGameScene(gameController),
            scale: {
                width: ActiveGameSceneGrid.getActiveGameExternalWidth(gameController.config),
                height: ActiveGameSceneGrid.getActiveGameExternalHeight(gameController.config),
                autoCenter: Phaser.Scale.CENTER_BOTH,
                mode: Phaser.Scale.FIT,
            },
            backgroundColor: 0x282828
            
        });
        this.gameController = gameController;
    }

}


new PhaserGameDelegate(GameOrchestrator.newGame({
    density: 0.3,
    tilePixelDim: 30,
    tilesColCount: 45,
    tilesRowCount: 20,
    checkpointCount: 3,
    timeBeforeFirstWaveSec: 20,
    timeBetweenWavesSec: 2
}));