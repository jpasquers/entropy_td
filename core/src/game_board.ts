import { calculateDistance, getTileCenterPx } from "./common/utils";
import { ActiveCreep } from "./enemy/creep";
import { getSearchAlgorithmInclusive } from "./pathfinder";
import { fromTowerType, Tower } from "./friendly/tower";
import { GameOrchestrator, TowerType } from ".";
import { Projectile } from "./friendly/projectile";

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

export class NoPathAvailable extends Error {}

export class GameBoard {
    config: GameBoardConfiguration;
    terrain!: Tile[][];
    towers: Tower[];
    start!: Coordinate;
    checkpoints!: Coordinate[];
    finish!: Coordinate;
    id: string;
    static GLOBAL_ID: number = 0;

    walkingBestPathSegments!: Coordinate[][];
    walkingBestFullPath!: Coordinate[];
    walkingBestPathSegmentsPx!: PixelCoordinate[][];
    walkingBestFullPathPx!: PixelCoordinate[];
    orchestrator: GameOrchestrator;

    constructor(config: GameBoardConfiguration, orchestrator: GameOrchestrator) {
        this.config = config;
        this.orchestrator = orchestrator;
        this.towers = [];
        this.buildTiles();
        this.refreshStoredOptimalPaths();
        this.id = (++GameBoard.GLOBAL_ID).toString();
    }

    addTowerWithRollback(pos: Coordinate, towerType: TowerType) {
        let newTower = fromTowerType(pos, this.config.tilePixelDim, towerType);
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
            return segment.map((coord) => getTileCenterPx(coord, this.config.tilePixelDim));
        })
        this.walkingBestFullPathPx = this.walkingBestFullPath.map(coord => getTileCenterPx(coord, this.config.tilePixelDim));
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
        this.terrain = Array.from({length: this.config.tilesRowCount}, (aRow, row) => {
            return Array.from({length: this.config.tilesColCount})
        });
        let availableCoordinates = listAllCoordinates(this.config);
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
        return getTileCenterPx(this.start, this.config.tilePixelDim);
    }

    public numCols(): number {
        return this.terrain[0].length;
    }

    public numRows(): number {
        return this.terrain.length;
    }

    public getTile(coord: Coordinate): Tile {
        return this.terrain[coord.row][coord.col];
    }

    public isGrassTile(coord: Coordinate): boolean {
        return this.terrain[coord.row][coord.col].type === TileType.Grass;
    }

    public towerExistsAt(coord: Coordinate): boolean {
        let tower =  this.towers.find(tower => {
            return tower.pos.col === coord.col &&
                tower.pos.row === coord.row
        });
        //is this okay?
        return !(!(tower));
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

export interface GameBoardConfiguration {
    tilesColCount: number;
    tilesRowCount: number;
    tilePixelDim: number;
    density: number;
    checkpointCount: number;
}

//Logic to decide unimportant tile.
//return Math.random() > this.config.density ? {type: TileType.Grass} : {type: TileType.Rock};


export interface Tile {
    type: TileType
    checkPointNum?: number;
}

export const pickRandomAndRemove = (coordinates: Coordinate[]): Coordinate => {
    let selectedIdx = randomSpotInArray(coordinates.length);
    let coord = coordinates[selectedIdx];
    coordinates.splice(selectedIdx,1);
    return coord;
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

const randomSpotInArray = (size: number): number => {
   return Math.floor(Math.random() * size);
}

const BLOCKED = 1;
const FREE = 0;
const generatePathfindingGrid = (terrain: Tile[][], towers: Tower[]): number[][] => {
    return terrain.map((row, rowNum) => {
        return row.map((terrain, colNum) => {
            if (towers.find(tower => tower.pos.col === colNum && tower.pos.row === rowNum)) {
                return BLOCKED;
            }
            else if (!terrain || typeIsTraversable(terrain.type)) return FREE;
            else return BLOCKED;
        })
    })
}



