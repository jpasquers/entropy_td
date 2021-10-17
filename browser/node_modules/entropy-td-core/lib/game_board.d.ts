import { Tower, TowerType } from "./friendly/tower";
import { GameOrchestrator } from ".";
export declare enum TileType {
    Grass = 0,
    Rock = 1,
    Tower = 2,
    Checkpoint = 3,
    Start = 4,
    Finish = 5
}
export interface Coordinate {
    row: number;
    col: number;
}
export interface PixelCoordinate {
    pxRow: number;
    pxCol: number;
}
export declare class NoPathAvailable extends Error {
}
export declare class GameBoard {
    config: GameBoardConfiguration;
    terrain: Tile[][];
    towers: Tower[];
    start: Coordinate;
    checkpoints: Coordinate[];
    finish: Coordinate;
    id: string;
    static GLOBAL_ID: number;
    walkingBestPathSegments: Coordinate[][];
    walkingBestFullPath: Coordinate[];
    walkingBestPathSegmentsPx: PixelCoordinate[][];
    walkingBestFullPathPx: PixelCoordinate[];
    orchestrator: GameOrchestrator;
    constructor(config: GameBoardConfiguration, orchestrator: GameOrchestrator);
    addTowerWithRollback(pos: Coordinate, towerType: TowerType): void;
    refreshStoredOptimalPaths(): void;
    forEachSegment(fn: (start: Coordinate, end: Coordinate) => void): void;
    findOptimalPaths(): Coordinate[][];
    findOptimalPath(start: Coordinate, end: Coordinate): Coordinate[];
    buildTiles(): void;
    getWalkingBestPath(): Coordinate[];
    getWalkingBestPathPx(): PixelCoordinate[];
    getWalkingBestPathSegments(): Coordinate[][];
    getWalkingBestPathSegmentsPx(): PixelCoordinate[][];
    getStartCenterPx(): PixelCoordinate;
    numCols(): number;
    numRows(): number;
    getTile(coord: Coordinate): Tile;
    isGrassTile(coord: Coordinate): boolean;
    towerExistsAt(coord: Coordinate): boolean;
    isOpen(coord: Coordinate): boolean;
    fillInRemainingTiles(): void;
    makePathTraversible(start: Coordinate, end: Coordinate): void;
}
export interface GameBoardConfiguration {
    tilesColCount: number;
    tilesRowCount: number;
    tilePixelDim: number;
    density: number;
    checkpointCount: number;
}
export interface Tile {
    type: TileType;
    checkPointNum?: number;
}
export declare const pickRandomAndRemove: (coordinates: Coordinate[]) => Coordinate;
export declare const listAllCoordinates: (config: GameBoardConfiguration) => Coordinate[];
export declare const typeIsTraversable: (type: TileType) => boolean;
export declare const listAllTraversableCoordinates: (config: GameBoardConfiguration, tiles: Tile[][]) => Coordinate[];
