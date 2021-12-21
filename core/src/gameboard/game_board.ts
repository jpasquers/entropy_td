import { calculateDistance, coordsEqual, getAllCoordinates, getPxCenter, getTileCenterPx, randomItemIn, randomSpotInArray } from "../common/utils";
import { getSearchAlgorithmInclusive } from "../pathfinder";
import { LiveTower } from "../friendly/tower";
import { GameOrchestrator, TowerType } from "..";
import { BonusIncomeTilesConfiguration, GameBoardConfiguration } from "../config";
import { getLargestConnectedGrid } from "./connected_component";
import { OccupiesBoard } from "./model";

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

export class MoneyTile extends OccupiesBoard {
    waveMultValue: number;

    constructor(tlCoord: Coordinate, waveMultValue: number) {
        super(tlCoord, {width: 1, height: 1});
        this.waveMultValue = waveMultValue;
    }
}

export class NoBuildBlocker extends OccupiesBoard {}

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
    rocks!: Rock[];
    noBuildBlockers!: NoBuildBlocker[];
    moneyTiles!: MoneyTile[];
    towers: LiveTower[];
    start!: Coordinate;
    checkpoints!: Coordinate[];
    finish!: Coordinate;
    fullyBlockedTiles!: Coordinate[];
    playerBlockedTiles!: Coordinate[];
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
            this.generatePathFindingGrid(),
            start,
            end
        );
        if (path.length === 0) throw new NoPathAvailable();
        return path;
    }
    
    buildTiles(): void {
        let allCoordinates = listAllCoordinates(this.config);
        this.rocks = this.generateRocks();
        this.noBuildBlockers = this.generateBlockers();
        let availableCoordinates = allCoordinates.filter((coord) => !this.isFullyBlocked(coord))
        let largestComponent = getLargestConnectedGrid(availableCoordinates);
        this.start = pickRandomAndRemove(largestComponent);
        this.checkpoints = Array.from({length: this.config.checkpointCount}, (v,index) => {
            return pickRandomAndRemove(largestComponent);
        });
        this.finish = pickRandomAndRemove(largestComponent);
        this.moneyTiles = this.config.bonusIncomeTiles.map((bonus) => {
            return new MoneyTile(pickRandomAndRemove(largestComponent), bonus.waveMultValue);
        })
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
            .every(coord => this.isOpenForTower(coord));
    }


    public getAllRockCoords(): Coordinate[] {
        let allRockCoords = this.rocks.reduce((prev, current) => {
            prev.push(...current.coords);
            return prev;
        }, new Array<Coordinate>());
        return allRockCoords.filter(rockCoord => this.inBounds(rockCoord));
    }

    public inBounds(coord: Coordinate): boolean {
        return coord.col >= 0 && coord.row >= 0 &&
            coord.col < this.config.tilesColCount &&
            coord.row < this.config.tilesRowCount;
    }

    public getAllTowerCoords(): Coordinate[] {
        return this.towers.reduce((prev,curr) => {
            prev.push(...curr.coords);
            return prev;
        }, new Array<Coordinate>());
    }

    public getFullyBlockedTiles(): Coordinate[] {
        return this.getAllRockCoords().concat(this.getAllTowerCoords());
    }

    public getFullyEmptyTiles(): Coordinate[] {
        return this.listAllCoordinates().filter((coord) => this.isFullyEmpty(coord));
    }

    public isFullyEmpty(coord: Coordinate): boolean {
        return !this.isFullyBlocked(coord) && !this.isPivotTile(coord)
            && !this.onNoBuildBlocker(coord);
    }

    public isFullyBlocked(coord: Coordinate): boolean {
        return this.getFullyBlockedTiles().some(blocked => coordsEqual(blocked,coord));
    }

    public isTraversible(coord: Coordinate): boolean {
        return !(this.isFullyBlocked(coord));
    }

    public isOpenForTower(coord: Coordinate): boolean {
        return this.isFullyEmpty(coord);
    }

    public onNoBuildBlocker(testCoord: Coordinate): boolean {
        return this.noBuildBlockers.some(blocker => {
            return blocker.coords.some(coord => coordsEqual(coord, testCoord));
        })
    }

    public isPivotTile(coord: Coordinate): boolean {
        return coordsEqual(coord, this.start) ||
            this.checkpoints.some(checkpoint => coordsEqual(coord, checkpoint)) ||
            coordsEqual(coord, this.finish);
    }

    public listAllCoordinates(): Coordinate[] {
        return listAllCoordinates(this.config);
    }

    private generateRocks (): Rock[] {
        return Array.from({length: this.config.rockCount}).map(() => {
            let rotated = Math.random() > 0.5 ? true : false;
            return new Rock(randomCoordinate(this.config), rotated);
        })
    }
    
    private generateBlockers (): NoBuildBlocker[] {
        return this.config.noBuildBlockers.map((blocker => {
            return new NoBuildBlocker(randomCoordinate(this.config), {
               width: blocker.dim,
               height: blocker.dim
            });
        }));
    }

    

    public generatePathFindingGrid(): number[][] {
        const BLOCKED = 1;
        const FREE = 0;
        let initial = Array.from({length: this.config.tilesRowCount}, (v,k) => {
            return Array.from({length: this.config.tilesColCount}, (v,k) => FREE);
        })

        this.getFullyBlockedTiles().forEach((blockedTile) => {
            initial[blockedTile.row][blockedTile.col] = 1;
        });
        return initial;
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
    return randomItemIn(coords);
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



