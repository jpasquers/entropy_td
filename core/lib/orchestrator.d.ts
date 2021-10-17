import { ActionHandler } from "./actions/action_handler";
import { ActiveCreep } from "./enemy/creep";
import { Wave } from "./enemy/wave";
import { WaveExecutor } from "./enemy/wave_executor";
import { GameBoard, GameBoardConfiguration, PixelCoordinate } from "./game_board";
import { PlayerState, PlayerStateConfiguration } from "./friendly/player";
import { Timeline, TimelineConfiguration } from "./timeline";
import { Tower, TowerType } from "./friendly/tower";
import { ProjectileSummary } from "./friendly/projectile";
export declare type CustomGameConfiguration = Partial<GameConfiguration>;
export interface GameConfiguration extends GameBoardConfiguration, TimelineConfiguration, PlayerStateConfiguration {
}
export interface GameState {
    activeCreeps: ActiveCreep[];
    timeBeforeWaveSec: number;
    optimalPathSegmentsPx: PixelCoordinate[][];
    towers: Tower[];
    projectiles: ProjectileSummary[];
    money: number;
}
export interface PlayerAction {
}
export declare type GameStateSubscriber = (state: GameState) => void;
export declare class GameOrchestrator {
    config: GameConfiguration;
    gameBoard: GameBoard;
    timeline: Timeline;
    currentWaveExecutor: WaveExecutor | undefined;
    playerState: PlayerState;
    playerActionHandler: ActionHandler;
    constructor(customConfigs: CustomGameConfiguration);
    static newGame(customConfigs: CustomGameConfiguration): GameOrchestrator;
    actor(): ActionHandler;
    nextFrame(timeMs: number): GameState;
    getEffectiveTowersList(): TowerType[];
    canAfford(money: number): boolean;
    getBoard(): GameBoard;
    startWave(wave: Wave): void;
    endWave(): void;
}
