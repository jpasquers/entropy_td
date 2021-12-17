import { calculateDistance, coordsEqual, getAllCoordinates, getPxCenter, getTileCenterPx, randomSpotInArray } from "../common/utils";
import { getSearchAlgorithmInclusive } from "../pathfinder";
import { LiveTower } from "../friendly/tower";
import { GameOrchestrator, TowerType } from "..";
import { BonusIncomeTilesConfiguration, GameBoardConfiguration } from "../config";

export enum TileType {
    Grass,
    Rock,
    Tower,
    Checkpoint,
    Start,
    Finish
}

export interface Coordinate {
    row: number;
    col: number;
}

export interface PixelCoordinate {
    pxRow: number;
    pxCol: number;
}

export interface Dim2D {
    width: number;
    height: number;
}

export interface PixDim2D {
    pxWidth: number;
    pxHeight: number;
}

export class OccupiesBoard {
    tlCoord: Coordinate;
    size: Dim2D;
    coords: Coordinate[];
    pxCenter: PixelCoordinate;

    constructor(tlCoord: Coordinate, size: Dim2D) {
        this.tlCoord = tlCoord;
        this.size = size;
        this.coords = getAllCoordinates(tlCoord, size);
        this.pxCenter = getPxCenter(tlCoord, size);
    }
}

export class Rock extends OccupiesBoard {
    constructor(tlCoord: Coordinate, rotated: boolean) {
        let dim = rotated ? {width: 2, height: 3} : {width: 3, height: 2};
        super(tlCoord, dim);
    }
}

export class NoPathAvailable extends Error {}

export class GameBoard {
    config: GameBoardConfiguration;
    size: Dim2D;
    rocks: Rock[];
    towers: LiveTower[];
    start!: Coordinate;
    checkpoints!: Coordinate[];
    finish!: Coordinate;
    fullyBlockedTiles!: Coordinate[];
    playerBlockedTiles: Coordinate[];
    id: string;
    static GLOBAL_ID: number = 0;

    walkingBestPathSegments!: Coordinate[][];
    walkingBestFullPath!: Coordinate[];
    walkingBestPathSegmentsPx!: PixelCoordinate[][];
    walkingBestFullPathPx!: PixelCoordinate[];
    orchestrator: GameOrchestrator;

    constructor(config: GameBoardConfiguration, orchestrator: GameOrchestrator) {
        this.config = config;
        this.size = {
            width: this.config.tilesColCount,
            height: this.config.tilesRowCount
        }
        this.orchestrator = orchestrator;
        this.towers = [];
        this.buildTiles();
        this.refreshStoredOptimalPaths();
        this.id = (++GameBoard.GLOBAL_ID).toString();
    }

    addTowerWithRollback(tlCoord: Coordinate, towerType: TowerType) {
        let newTower = new LiveTower(tlCoord, towerType);
        let towerId = newTower.id;
        this.towers.push(newTower);
        try {
            this.refreshStoredOptimalPaths();
        }
        catch(e) {
            let index = this.towers.findIndex(tower => tower.id === towerId);
            this.towers.splice(index,1);
            throw e;
        }
    }

    refreshStoredOptimalPaths(): void {
        this.walkingBestPathSegments = this.findOptimalPaths();
        this.walkingBestFullPath = this.walkingBestPathSegments.reduce((previous, current) => {
            return current.concat(previous);
        }, []);
        this.walkingBestPathSegmentsPx = this.walkingBestPathSegments.map((segment) => {
            return segment.map((coord) => getTileCenterPx(coord));
        })
        this.walkingBestFullPathPx = this.walkingBestFullPath.map(coord => getTileCenterPx(coord));
    }

    forEachSegment(fn: (start: Coordinate, end: Coordinate)=>void): void {
        fn(this.start, this.checkpoints[0]);
        this.checkpoints.forEach((checkpoint, idx) => {
            if (idx === this.checkpoints.length-1) fn(checkpoint, this.finish);
            else fn(checkpoint, this.checkpoints[idx+1]);
        })
    }

    findOptimalPaths(): Coordinate[][] {
        let paths: Coordinate[][] = [];
        this.forEachSegment((start,end) => {
            paths.push(this.findOptimalPath(start,end));
        })
        return paths;
    }

    

    findOptimalPath(start: Coordinate, end:Coordinate): Coordinate[] {
        let path = getSearchAlgorithmInclusive().search(
            generatePathfindingGrid(this.terrain, this.towers),
            start,
            end
        );
        if (path.length === 0) throw new NoPathAvailable();
        return path;
    }
    
    buildTiles(): void {

        let availableCoordinates = listAllCoordinates(this.config);
        this.rocks = assignRocks(this.config);
        this.fullyBlockedTiles = this.rocks.reduce((prev, current) => {
            prev.push(...current.coords);
            return prev;
        }, new Array<Coordinate>());
        this.start = pickRandomAndRemove(availableCoordinates);
        this.checkpoints = Array.from({length: this.config.checkpointCount}, (v,index) => {
            return pickRandomAndRemove(availableCoordinates);
        });
        this.finish = pickRandomAndRemove(availableCoordinates);
        
        this.terrain[this.start.row][this.start.col] = {type: TileType.Start};
        this.checkpoints.forEach((checkpoint, idx) => {
            //meh
            this.terrain[checkpoint.row][checkpoint.col] = {type: TileType.Checkpoint, checkPointNum: idx+1};
        })
        this.terrain[this.finish.row][this.finish.col] = {type: TileType.Finish};

        this.makePathTraversible(this.start, this.checkpoints[0]);
        this.checkpoints.forEach((checkpoint, idx) => {
            if (idx === this.checkpoints.length-1) return;
            this.makePathTraversible(checkpoint, this.checkpoints[idx+1]);
        })
        this.makePathTraversible(this.checkpoints[this.checkpoints.length-1], this.finish);
        
        this.fillInRemainingTiles();

    }

    public getWalkingBestPath(): Coordinate[] {
        return this.walkingBestFullPath;
    }

    public getWalkingBestPathPx(): PixelCoordinate[] {
        return this.walkingBestFullPathPx;
    }

    public getWalkingBestPathSegments(): Coordinate[][] {
        return this.walkingBestPathSegments;
    }

    public getWalkingBestPathSegmentsPx(): PixelCoordinate[][] {
        return this.walkingBestPathSegmentsPx;
    }

    public getStartCenterPx(): PixelCoordinate {
        return getTileCenterPx(this.start);
    }

    public numCols(): number {
        return this.size.width
    }

    public numRows(): number {
        return this.size.height;
    }

    public towerExistsAt(coord: Coordinate): boolean {
        let tower =  this.towers.find(tower => towerIncludesCoord(tower,coord));
        return !(!(tower));
    }
    
    public spaceForTowerAt(towerType: TowerType, tlCoord: Coordinate): boolean {
        return getAllCoordinates(tlCoord, towerType.dim)
            .every(coord => this.isOpen(coord));
    }

    public isOpen(coord: Coordinate): boolean {
        return this.isGrassTile(coord) && !this.towerExistsAt(coord);
    }

    fillInRemainingTiles() {
        listAllCoordinates(this.config).forEach(coord => {
            if (!this.getTile(coord)) {
                this.terrain[coord.row][coord.col] = 
                    Math.random() > this.config.density 
                        ? {type: TileType.Grass} 
                        : {type: TileType.Rock};
            }
        })
    }

    makePathTraversible(start: Coordinate, end: Coordinate) {
        let path: Coordinate[] = this.findOptimalPath(start,end);
        path.forEach(tileCoord => {
            if (!this.terrain[tileCoord.row][tileCoord.col]) {
                this.terrain[tileCoord.row][tileCoord.col] = {type: TileType.Grass};
            }
        });
    }
}

export interface Tile {
    type: TileType
    checkPointNum?: number;
    bonusIncomeWaveMult?: number;
}

export const pickRandomAndRemove = (coordinates: Coordinate[]): Coordinate => {
    let selectedIdx = randomSpotInArray(coordinates.length);
    let coord = coordinates[selectedIdx];
    coordinates.splice(selectedIdx,1);
    return coord;
}

export const randomCoordinate = (config: GameBoardConfiguration): Coordinate => {
    let coords = listAllCoordinates(config);
    let selectedIdx = randomSpotInArray(coords.length);
    return coords[selectedIdx];
}

export const listAllCoordinates = (config: GameBoardConfiguration): Coordinate[] => {
    let coords = [];
    for (let row=0; row<config.tilesRowCount; row++) {
        for (let col=0; col<config.tilesColCount; col++) {
            coords.push({row,col});
        }
    }
    return coords;
}

export const typeIsTraversable = (type: TileType): boolean => {
    return type === TileType.Grass
    || type === TileType.Checkpoint
    || type === TileType.Finish
    || type === TileType.Start;
}

export const listAllTraversableCoordinates = (config: GameBoardConfiguration, tiles: Tile[][]): Coordinate[] => {
    return listAllCoordinates(config).filter(coord => typeIsTraversable(tiles[coord.row][coord.col].type));
}


const towerIncludesCoord = (tower: LiveTower, coord: Coordinate): boolean => {
    return getAllCoordinates(tower.tlCoord, tower.type.dim).some(coordB => coordsEqual(coord,coordB));
}

const BLOCKED = 1;
const FREE = 0;
const generatePathfindingGrid = (terrain: Tile[][], towers: LiveTower[]): number[][] => {
    return terrain.map((row, rowNum) => {
        return row.map((terrain, colNum) => {
            if (towers.find(tower => towerIncludesCoord(tower, {col: colNum, row: rowNum}))) {
                return BLOCKED;
            }
            else if (!terrain || typeIsTraversable(terrain.type)) return FREE;
            else return BLOCKED;
        })
    })
}

const assignRocks = (config: GameBoardConfiguration): Rock[] => {
    let rotated = Math.random() > 0.5 ? true : false;
    return Array.from({length: config.rockCount}).map(() => {
        return new Rock(randomCoordinate(config), rotated);
    })
}
