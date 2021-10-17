import { simpleGroundWave } from "./enemy/wave";
/**
 * Tracks the time before and between each wave.
 * Inactive during waves since waves are dictated by frames not time.
 */
export class Timeline {
    config;
    isWaveActive;
    allWaves;
    timeBeforeWaveMs;
    activeWave;
    nextWaveIdx;
    orchestrator;
    constructor(config, orchestrator) {
        this.config = config;
        this.isWaveActive = false;
        this.allWaves = [simpleGroundWave(), simpleGroundWave(), simpleGroundWave()];
        //TODO the logic of active vs not is wack
        this.activeWave = undefined;
        this.timeBeforeWaveMs = 10000000000;
        this.nextWaveIdx = 0;
        this.orchestrator = orchestrator;
    }
    start() {
        this.timeBeforeWaveMs = this.config.timeBeforeFirstWaveSec * 1000;
    }
    endWave() {
        this.activeWave = undefined;
        this.isWaveActive = false;
        this.timeBeforeWaveMs = this.config.timeBetweenWavesSec * 1000;
    }
    step(timeMs) {
        if (!this.activeWave) {
            this.timeBeforeWaveMs = this.timeBeforeWaveMs - timeMs;
            if (this.timeBeforeWaveMs <= 0) {
                this.activeWave = this.allWaves[this.nextWaveIdx];
                this.nextWaveIdx++;
                this.orchestrator.startWave(this.activeWave);
                this.isWaveActive = true;
            }
        }
    }
}
export const createAndStartTimeline = (config, orchestrator) => {
    let timeline = new Timeline(config, orchestrator);
    timeline.start();
    return timeline;
};
