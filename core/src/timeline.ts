import { TimelineConfiguration } from "./config";
import { simpleGroundWave, Wave } from "./enemy/wave";
import { GameOrchestrator } from "./orchestrator";
/**
 * Tracks the time before and between each wave.
 * Inactive during waves since waves are dictated by frames not time.
 */
export class Timeline {
    config: TimelineConfiguration;
    isWaveActive: boolean;
    allWaves: Wave[];
    timeBeforeWaveMs: number;
    activeWave: Wave | undefined;
    nextWaveIdx: number;
    orchestrator: GameOrchestrator

    constructor(config: TimelineConfiguration, orchestrator: GameOrchestrator) {
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

    step(timeMs: number) {
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

export const createAndStartTimeline = (config: TimelineConfiguration, orchestrator: GameOrchestrator): Timeline => {
    let timeline = new Timeline(config, orchestrator);
    timeline.start();
    return timeline;
}