import { GameBoard } from "..";
import { GameOrchestrator } from "../orchestrator";
import { PixelCoordinate, Tile } from "../game_board";
import { ActiveCreep, Creep } from "./creep";
import { Wave } from "./wave";
import { Tower } from "../friendly/tower";
import { ProjectileTracker } from "../friendly/projectile_tracker";
/**
 * Manages the progress of a single active wave against a GameBoard.
 * Each frame:
 * 1) If appropriate, spawn a new creep
 * 2) Move all active creeps
 * 3) If a creep reaches the Finish tile, remove it.
 * 4) If all creeps have finished, trigger the end wave event.
 */
export declare class WaveExecutor {
    board: GameBoard;
    wave: Wave;
    nextCreepIdx: number;
    orchestrator: GameOrchestrator;
    framesTillNextCreep: number;
    creepsRemoved: number;
    projectileTracker: ProjectileTracker;
    constructor(board: GameBoard, wave: Wave, orchestrator: GameOrchestrator);
    addNextCreep(): void;
    placeAtStart(creep: Creep): ActiveCreep;
    start(): void;
    isPivotTile(tile: Tile): boolean;
    removeActiveCreep(id: string): void;
    moveActiveCreeps(): void;
    moveActiveCreep(creep: ActiveCreep): void;
    moveTowards(creep: ActiveCreep, targetPosPx: PixelCoordinate): void;
    hurtCreep(id: string, dmg: number): void;
    moreCreepsToAdd(): boolean;
    stepFrame(): void;
    creepIsInWave(id: string): boolean;
    creepIsTargettable(tower: Tower, creep: ActiveCreep, dim: number): boolean;
    stepFrameForTowers(): void;
    tryToTargetCreep(tower: Tower, activeCreeps: ActiveCreep[]): void;
}
export declare const creepIsInRange: (tower: Tower, creep: ActiveCreep, dim: number) => boolean;
export declare const firstInRange: (tower: Tower, activeCreeps: ActiveCreep[], dim: number) => ActiveCreep | undefined;
