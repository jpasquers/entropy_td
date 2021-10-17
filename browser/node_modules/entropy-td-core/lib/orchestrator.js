import { ActionHandler } from "./actions/action_handler";
import { WaveExecutor } from "./enemy/wave_executor";
import { GameBoard } from "./game_board";
import { PlayerState } from "./friendly/player";
import { createAndStartTimeline } from "./timeline";
import defaultTowersMap from "./config/tower_types.json";
const DEFAULT_GAME_CONFIGURATION = {
    tilesRowCount: 30,
    tilesColCount: 30,
    tilePixelDim: 20,
    density: 0.7,
    checkpointCount: 3,
    timeBeforeFirstWaveSec: 2,
    timeBetweenWavesSec: 20,
    startingMoney: 5000
};
export class GameOrchestrator {
    config;
    gameBoard;
    timeline;
    currentWaveExecutor;
    playerState;
    playerActionHandler;
    constructor(customConfigs) {
        this.config = {
            ...DEFAULT_GAME_CONFIGURATION,
            ...customConfigs
        };
        this.gameBoard = new GameBoard(this.config, this);
        this.timeline = createAndStartTimeline(this.config, this);
        this.playerState = new PlayerState(this.config);
        this.playerActionHandler = new ActionHandler(this.playerState, this.gameBoard, this.timeline);
    }
    static newGame(customConfigs) {
        return new GameOrchestrator(customConfigs);
    }
    actor() {
        return this.playerActionHandler;
    }
    nextFrame(timeMs) {
        this.timeline.step(timeMs);
        this.currentWaveExecutor?.stepFrame();
        return {
            activeCreeps: this.currentWaveExecutor?.wave.activeCreeps ?? [],
            timeBeforeWaveSec: Math.floor(this.timeline.timeBeforeWaveMs / 1000),
            optimalPathSegmentsPx: this.gameBoard.getWalkingBestPathSegmentsPx(),
            towers: this.gameBoard.towers,
            projectiles: this.currentWaveExecutor?.projectileTracker.summaries() ?? [],
            money: this.playerState.money
        };
    }
    getEffectiveTowersList() {
        return Object.values(defaultTowersMap);
    }
    canAfford(money) {
        return this.playerState.canAfford(money);
    }
    getBoard() {
        return this.gameBoard;
    }
    startWave(wave) {
        this.currentWaveExecutor = new WaveExecutor(this.gameBoard, wave, this);
        this.currentWaveExecutor.start();
    }
    endWave() {
        this.currentWaveExecutor = undefined;
        this.timeline.endWave();
    }
}
