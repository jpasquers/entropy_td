import { getTileCenterPx } from "./common/utils";
import { getSearchAlgorithmInclusive } from "./pathfinder";
import { fromTowerType } from "./friendly/tower";
export var TileType;
(function (TileType) {
    TileType[TileType["Grass"] = 0] = "Grass";
    TileType[TileType["Rock"] = 1] = "Rock";
    TileType[TileType["Tower"] = 2] = "Tower";
    TileType[TileType["Checkpoint"] = 3] = "Checkpoint";
    TileType[TileType["Start"] = 4] = "Start";
    TileType[TileType["Finish"] = 5] = "Finish";
})(TileType || (TileType = {}));
export class NoPathAvailable extends Error {
}
export class GameBoard {
    config;
    terrain;
    towers;
    start;
    checkpoints;
    finish;
    id;
    static GLOBAL_ID = 0;
    walkingBestPathSegments;
    walkingBestFullPath;
    walkingBestPathSegmentsPx;
    walkingBestFullPathPx;
    orchestrator;
    constructor(config, orchestrator) {
        this.config = config;
        this.orchestrator = orchestrator;
        this.towers = [];
        this.buildTiles();
        this.refreshStoredOptimalPaths();
        this.id = (++GameBoard.GLOBAL_ID).toString();
    }
    addTowerWithRollback(pos, towerType) {
        let newTower = fromTowerType(pos, this.config.tilePixelDim, towerType);
        let towerId = newTower.id;
        this.towers.push(newTower);
        try {
            this.refreshStoredOptimalPaths();
        }
        catch (e) {
            let index = this.towers.findIndex(tower => tower.id === towerId);
            this.towers.splice(index, 1);
            throw e;
        }
    }
    refreshStoredOptimalPaths() {
        this.walkingBestPathSegments = this.findOptimalPaths();
        this.walkingBestFullPath = this.walkingBestPathSegments.reduce((previous, current) => {
            return current.concat(previous);
        }, []);
        this.walkingBestPathSegmentsPx = this.walkingBestPathSegments.map((segment) => {
            return segment.map((coord) => getTileCenterPx(coord, this.config.tilePixelDim));
        });
        this.walkingBestFullPathPx = this.walkingBestFullPath.map(coord => getTileCenterPx(coord, this.config.tilePixelDim));
    }
    forEachSegment(fn) {
        fn(this.start, this.checkpoints[0]);
        this.checkpoints.forEach((checkpoint, idx) => {
            if (idx === this.checkpoints.length - 1)
                fn(checkpoint, this.finish);
            else
                fn(checkpoint, this.checkpoints[idx + 1]);
        });
    }
    findOptimalPaths() {
        let paths = [];
        this.forEachSegment((start, end) => {
            paths.push(this.findOptimalPath(start, end));
        });
        return paths;
    }
    findOptimalPath(start, end) {
        let path = getSearchAlgorithmInclusive().search(generatePathfindingGrid(this.terrain, this.towers), start, end);
        if (path.length === 0)
            throw new NoPathAvailable();
        return path;
    }
    buildTiles() {
        this.terrain = Array.from({ length: this.config.tilesRowCount }, (aRow, row) => {
            return Array.from({ length: this.config.tilesColCount });
        });
        let availableCoordinates = listAllCoordinates(this.config);
        this.start = pickRandomAndRemove(availableCoordinates);
        this.checkpoints = Array.from({ length: this.config.checkpointCount }, (v, index) => {
            return pickRandomAndRemove(availableCoordinates);
        });
        this.finish = pickRandomAndRemove(availableCoordinates);
        this.terrain[this.start.row][this.start.col] = { type: TileType.Start };
        this.checkpoints.forEach((checkpoint, idx) => {
            //meh
            this.terrain[checkpoint.row][checkpoint.col] = { type: TileType.Checkpoint, checkPointNum: idx + 1 };
        });
        this.terrain[this.finish.row][this.finish.col] = { type: TileType.Finish };
        this.makePathTraversible(this.start, this.checkpoints[0]);
        this.checkpoints.forEach((checkpoint, idx) => {
            if (idx === this.checkpoints.length - 1)
                return;
            this.makePathTraversible(checkpoint, this.checkpoints[idx + 1]);
        });
        this.makePathTraversible(this.checkpoints[this.checkpoints.length - 1], this.finish);
        this.fillInRemainingTiles();
    }
    getWalkingBestPath() {
        return this.walkingBestFullPath;
    }
    getWalkingBestPathPx() {
        return this.walkingBestFullPathPx;
    }
    getWalkingBestPathSegments() {
        return this.walkingBestPathSegments;
    }
    getWalkingBestPathSegmentsPx() {
        return this.walkingBestPathSegmentsPx;
    }
    getStartCenterPx() {
        return getTileCenterPx(this.start, this.config.tilePixelDim);
    }
    numCols() {
        return this.terrain[0].length;
    }
    numRows() {
        return this.terrain.length;
    }
    getTile(coord) {
        return this.terrain[coord.row][coord.col];
    }
    isGrassTile(coord) {
        return this.terrain[coord.row][coord.col].type === TileType.Grass;
    }
    towerExistsAt(coord) {
        let tower = this.towers.find(tower => {
            return tower.pos.col === coord.col &&
                tower.pos.row === coord.row;
        });
        //is this okay?
        return !(!(tower));
    }
    isOpen(coord) {
        return this.isGrassTile(coord) && !this.towerExistsAt(coord);
    }
    fillInRemainingTiles() {
        listAllCoordinates(this.config).forEach(coord => {
            if (!this.getTile(coord)) {
                this.terrain[coord.row][coord.col] =
                    Math.random() > this.config.density
                        ? { type: TileType.Grass }
                        : { type: TileType.Rock };
            }
        });
    }
    makePathTraversible(start, end) {
        let path = this.findOptimalPath(start, end);
        path.forEach(tileCoord => {
            if (!this.terrain[tileCoord.row][tileCoord.col]) {
                this.terrain[tileCoord.row][tileCoord.col] = { type: TileType.Grass };
            }
        });
    }
}
export const pickRandomAndRemove = (coordinates) => {
    let selectedIdx = randomSpotInArray(coordinates.length);
    let coord = coordinates[selectedIdx];
    coordinates.splice(selectedIdx, 1);
    return coord;
};
export const listAllCoordinates = (config) => {
    let coords = [];
    for (let row = 0; row < config.tilesRowCount; row++) {
        for (let col = 0; col < config.tilesColCount; col++) {
            coords.push({ row, col });
        }
    }
    return coords;
};
export const typeIsTraversable = (type) => {
    return type === TileType.Grass
        || type === TileType.Checkpoint
        || type === TileType.Finish
        || type === TileType.Start;
};
export const listAllTraversableCoordinates = (config, tiles) => {
    return listAllCoordinates(config).filter(coord => typeIsTraversable(tiles[coord.row][coord.col].type));
};
const randomSpotInArray = (size) => {
    return Math.floor(Math.random() * size);
};
const BLOCKED = 1;
const FREE = 0;
const generatePathfindingGrid = (terrain, towers) => {
    return terrain.map((row, rowNum) => {
        return row.map((terrain, colNum) => {
            if (towers.find(tower => tower.pos.col === colNum && tower.pos.row === rowNum)) {
                return BLOCKED;
            }
            else if (!terrain || typeIsTraversable(terrain.type))
                return FREE;
            else
                return BLOCKED;
        });
    });
};
