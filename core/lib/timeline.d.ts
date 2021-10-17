import { Wave } from "./enemy/wave";
import { GameOrchestrator } from "./orchestrator";
/**
 * Tracks the time before and between each wave.
 * Inactive during waves since waves are dictated by frames not time.
 */
export declare class Timeline {
    config: TimelineConfiguration;
    isWaveActive: boolean;
    allWaves: Wave[];
    timeBeforeWaveMs: number;
    activeWave: Wave | undefined;
    nextWaveIdx: number;
    orchestrator: GameOrchestrator;
    constructor(config: TimelineConfiguration, orchestrator: GameOrchestrator);
    start(): void;
    endWave(): void;
    step(timeMs: number): void;
}
export interface TimelineConfiguration {
    timeBeforeFirstWaveSec: number;
    timeBetweenWavesSec: number;
}
export declare const createAndStartTimeline: (config: TimelineConfiguration, orchestrator: GameOrchestrator) => Timeline;
