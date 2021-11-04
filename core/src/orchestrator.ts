import { ActionHandler } from "./actions/action_handler";
import { ActiveCreep } from "./enemy/creep";
import { Wave } from "./enemy/wave";
import { WaveExecutor } from "./enemy/wave_executor";
import { GameBoard, PixelCoordinate } from "./game_board";
import { PlayerGameState } from "./friendly/player";
import { createAndStartTimeline, Timeline } from "./timeline";
import { LiveTower } from "./friendly/tower";
import { Projectile, ProjectileSummary } from "./friendly/projectile";
import { GameInstanceConfiguration, generateGameConfiguration, TowerType } from "./config";

export type CustomGameConfiguration = Partial<GameInstanceConfiguration>;

export interface GameState {
    activeCreeps: ActiveCreep[];
    timeBeforeWaveSec: number;
    optimalPathSegmentsPx: PixelCoordinate[][];
    towers: LiveTower[];
    projectiles: ProjectileSummary[];
    money: number;
}

export class GameOrchestrator {
    config: GameInstanceConfiguration;
    gameBoard: GameBoard;
    timeline: Timeline;
    currentWaveExecutor: WaveExecutor | undefined;
    playerState: PlayerGameState;
    playerActionHandler: ActionHandler;

    constructor() {
        this.config = generateGameConfiguration();
        this.gameBoard = new GameBoard(this.config, this);
        this.timeline = createAndStartTimeline(this.config, this);
        this.playerState = new PlayerGameState(this.config);
        this.playerActionHandler = new ActionHandler(this.playerState, this.gameBoard, this.timeline);
    }

    public static newGame() {
        return new GameOrchestrator();
    }

    public actor(): ActionHandler {
        return this.playerActionHandler;
    }

    public nextFrame(timeMs: number): GameState {
        this.timeline.step(timeMs);
        this.currentWaveExecutor?.stepFrame();
        return {
            activeCreeps: this.currentWaveExecutor?.wave.activeCreeps ?? [],
            timeBeforeWaveSec: Math.floor(this.timeline.timeBeforeWaveMs / 1000),
            optimalPathSegmentsPx: this.gameBoard.getWalkingBestPathSegmentsPx(),
            towers: this.gameBoard.towers,
            projectiles: this.currentWaveExecutor?.projectileTracker.summaries() ?? [],
            money: this.playerState.money
        }
    }

    public getEffectiveTowersList(): TowerType[] {
        return Object.values(this.config
            .towerTypes);
    }

    public canAfford(money: number) {
        return this.playerState.canAfford(money);
    }

    public getBoard(): GameBoard {
        return this.gameBoard;
    }

    public startWave(wave: Wave): void {
        this.currentWaveExecutor = new WaveExecutor(this.gameBoard, wave, this);
        this.currentWaveExecutor.start();
    }

    public endWave(): void  {
        this.currentWaveExecutor = undefined;
        this.timeline.endWave();
    }
}
