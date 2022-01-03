import { calculateDistance, coordsEqual, getFullObjectSpace, getPxCenter, getTileCenterPx, randomItemIn, randomSpotInArray } from "../common/utils";
import { getSearchAlgorithmInclusive } from "../pathfinder";
import { LiveTower } from "../friendly/tower";
import { GameOrchestrator, TowerType } from "..";
import { BonusIncomeTilesConfiguration, GameBoardConfiguration } from "../config";
import { OccupiesBoard } from "./model";
import { getLargestConnectedGrid } from "./component_graph";
import { coordFromKey, coordinateKey, getCoordinateMap } from "./coordinate_map";

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

const MONEY_TILE_SIZE: Dim2D = {
    width: 1,
    height: 1
}

export class MoneyTile extends OccupiesBoard {
    waveMultValue: number;

    constructor(tlCoord: Coordinate, waveMultValue: number) {
        super(tlCoord, MONEY_TILE_SIZE);
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

const LANDMARK_SIZE: Dim2D = {
    width: 2,
    height: 2
}

const START_SIZE: Dim2D = {
    width: 1, height: 1
}

const FINISH_SIZE: Dim2D = {
    width: 1, height: 1
}

export class Landmark extends OccupiesBoard {
    constructor(tlCoord: Coordinate) {
        super(tlCoord, LANDMARK_SIZE);
    }
}

export class Start extends OccupiesBoard {
    constructor(tlCoord: Coordinate) {
        super(tlCoord, START_SIZE);
    }
}

export class Finish extends OccupiesBoard {
    constructor(tlCoord: Coordinate) {
        super(tlCoord, FINISH_SIZE);
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
    start!: Start;
    checkpoints!: Landmark[];
    finish!: Finish;
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

    forEachSegment(fn: (start: Landmark, end: Landmark)=>void): void {
        fn(this.start, this.checkpoints[0]);
        this.checkpoints.forEach((checkpoint, idx) => {
            if (idx === this.checkpoints.length-1) fn(checkpoint, this.finish);
            else fn(checkpoint, this.checkpoints[idx+1]);
        })
    }

    findOptimalPaths(): Coordinate[][] {
        let paths: Coordinate[][] = [];
        paths.push(this.findOptimalPath(this.start.tlCoord, this.checkpoints[0].coords));
        this.checkpoints.forEach((checkpoint, idx) => {
            //Required because the previous segment could end on any of the checkpoint coords.
            let lastPath = paths[paths.length-1];
            let leftOffCoord = lastPath[lastPath.length-1];
            if (idx === this.checkpoints.length-1) {
                paths.push(this.findOptimalPath(leftOffCoord, this.finish.coords));
            }
            else {
                paths.push(this.findOptimalPath(leftOffCoord, this.checkpoints[idx+1].coords));
            }
        })
        return paths;
    }

    

    findOptimalPath(start: Coordinate, endOptions:Coordinate[]): Coordinate[] {
        let pathOptions = endOptions.map(end => getSearchAlgorithmInclusive().search(
            this.generatePathFindingGrid(),
            start,
            end
        ));
        let viablePaths = pathOptions.filter(pathOption => pathOption.length !== 0);
        if (viablePaths.length === 0) throw new NoPathAvailable();
        let pathLengths = viablePaths.map(viablePath => viablePath.length);
        let bestPathIdx = pathLengths.indexOf(Math.min(...pathLengths));
        return viablePaths[bestPathIdx];
    }
    
    buildTiles(): void {
        let allCoordinates = listAllCoordinates(this.config);
        this.rocks = this.generateRocks();
        this.noBuildBlockers = this.generateBlockers();
        let availableCoordinates = allCoordinates.filter((coord) => !this.isFullyBlocked(coord))
        let largestComponent = getLargestConnectedGrid(availableCoordinates);
        let startCornerstone = pickRandomCornerstone(largestComponent, START_SIZE, false);
        this.start = new Start(startCornerstone);
        this.checkpoints = Array.from({length: this.config.checkpointCount}, (v,index) => {
            return pickRandomCornerstone(largestComponent, LANDMARK_SIZE, false);
        }).map(cornerstone => new Landmark(cornerstone));
        let finishCornerstone = pickRandomCornerstone(largestComponent, FINISH_SIZE, false);
        this.finish = new Finish(finishCornerstone);
        this.moneyTiles = this.config.bonusIncomeTiles.map((bonus) => {
            let tileCornerstone = pickRandomCornerstone(largestComponent,MONEY_TILE_SIZE,false);
            return new MoneyTile(tileCornerstone, bonus.waveMultValue);
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
        return this.start.pxCenter;
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
        return getFullObjectSpace(tlCoord, towerType.dim)
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
        return this.start.containsCoord(coord) ||
            this.checkpoints.some(checkpoint => checkpoint.containsCoord(coord)) ||
            this.finish.containsCoord(coord);
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
            //Since we always use top left coordinate, that top left coordinate must 
            //be dim-1 from the edge.
            return new NoBuildBlocker(randomCoordinate(this.config, blocker.dim-1), {
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

export const pickRandomCornerstone = (coordinates: Coordinate[], requiredSize: Dim2D, withReplacement: boolean): Coordinate => {
    let viableCornerstones = getViableCornerstones(coordinates, requiredSize);
    let selectedIdx = randomSpotInArray(viableCornerstones.length);
    let cornerstone = viableCornerstones[selectedIdx];
    if (!withReplacement) {
        removeInPlace(coordinates, getFullObjectSpace(cornerstone, requiredSize));
    }
    return cornerstone;
}

//meh feels like a code smell.
//inefficient but just for one time generation.
export const removeInPlace = (from: Coordinate[], toRemoves: Coordinate[]): void => {
    toRemoves.forEach(toRemove => {
        let idxToRemove = from.findIndex(coord => coordsEqual(toRemove,coord));
        from.splice(idxToRemove,1);
    })
}

/**
 * 
 * All coordinates that have the sufficient free space to serve as the top left tile of the corresponding object.
 */
export const getViableCornerstones =(allFreeSpace: Coordinate[], requiredSize: Dim2D): Coordinate[] => {
    let freeSpaceMap = getCoordinateMap(allFreeSpace);
    return allFreeSpace.filter(freeSpot => {
        let requiredAllocatedSpace = getFullObjectSpace(freeSpot, requiredSize);
        let keysForRequiredAllocatedSpace: string[] = 
            requiredAllocatedSpace.map(piece => coordinateKey(piece));
        return keysForRequiredAllocatedSpace.every(
            key => key in freeSpaceMap
        );
    })
}

export const randomCoordinate = (config: GameBoardConfiguration, restrictedBorder: number = 0): Coordinate => {
    let coords = listAllCoordinates(config,restrictedBorder);
    return randomItemIn(coords);
}

export const listAllCoordinates = (config: GameBoardConfiguration, restrictedBorder: number = 0): Coordinate[] => {
    let coords = [];
    for (let row=restrictedBorder; row<config.tilesRowCount-restrictedBorder; row++) {
        for (let col=restrictedBorder; col<config.tilesColCount-restrictedBorder; col++) {
            coords.push({row,col});
        }
    }
    return coords;
}

const towerIncludesCoord = (tower: LiveTower, coord: Coordinate): boolean => {
    return getFullObjectSpace(tower.tlCoord, tower.type.dim).some(coordB => coordsEqual(coord,coordB));
}



