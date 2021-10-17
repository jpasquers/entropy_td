import { GameBoard } from "..";
import { GameOrchestrator } from "../orchestrator";
import { Coordinate, PixelCoordinate, Tile, TileType } from "../game_board";
import { ActiveCreep, Creep } from "./creep";
import { Wave } from "./wave";
import { calculateDistance, findNewPosition, getCurrentTile, getTileCenterPx } from "../common/utils";
import { Tower } from "../friendly/tower";
import { Projectile } from "../friendly/projectile";
import { ProjectileTracker } from "../friendly/projectile_tracker";

/**
 * Manages the progress of a single active wave against a GameBoard.
 * Each frame:
 * 1) If appropriate, spawn a new creep
 * 2) Move all active creeps
 * 3) If a creep reaches the Finish tile, remove it.
 * 4) If all creeps have finished, trigger the end wave event.
 */
export class WaveExecutor {
    board: GameBoard;
    wave: Wave;
    nextCreepIdx: number;
    orchestrator: GameOrchestrator;
    framesTillNextCreep: number;
    creepsRemoved: number;
    projectileTracker: ProjectileTracker;


    constructor(board: GameBoard, wave: Wave, orchestrator: GameOrchestrator) {
        this.board = board;
        this.wave = wave;
        this.nextCreepIdx = 0;
        this.framesTillNextCreep = 0;
        this.orchestrator = orchestrator;
        this.creepsRemoved = 0;
        this.projectileTracker = new ProjectileTracker(this);
    }

    addNextCreep() {
        let activeCreep = this.placeAtStart(this.wave.creeps[this.nextCreepIdx++]);
        this.wave.activeCreeps.push(activeCreep);
    }

    placeAtStart(creep: Creep): ActiveCreep {
        let startPosPx = this.board.getStartCenterPx();
        return {
            ...creep,
            pxPos: startPosPx,
            checkpointsCrossed: 0,
            health: creep.maxHealth
        }
    }

    start() {
        this.addNextCreep();
        this.framesTillNextCreep = this.wave.config.creepFrameSeparation;
    }

    isPivotTile(tile: Tile): boolean {
        return tile.type === TileType.Start || tile.type === TileType.Checkpoint;
    }

    removeActiveCreep(id: string) {
        let toRemove = this.wave.activeCreeps.findIndex(activeCreep => id === activeCreep.id);
        this.wave.activeCreeps.splice(toRemove,1);
        this.creepsRemoved++;
    }

    moveActiveCreeps() {
        this.wave.activeCreeps.forEach(activeCreep => this.moveActiveCreep(activeCreep));
    }

    moveActiveCreep(creep: ActiveCreep) {
        let walkingPaths = this.board.getWalkingBestPathSegments();
        let activeSegment: Coordinate[] = walkingPaths[creep.checkpointsCrossed];
        let currentCoord = getCurrentTile(creep.pxPos, this.board.config.tilePixelDim);
        let currentIndexInSegment = activeSegment.findIndex(coord => 
            coord.col === currentCoord.col && coord.row === currentCoord.row);
        if (this.board.getTile(currentCoord).type === TileType.Finish && creep.checkpointsCrossed === walkingPaths.length-1) {
            this.removeActiveCreep(creep.id);
        }
        else if (currentIndexInSegment === activeSegment.length-1 && this.isPivotTile(this.board.getTile(currentCoord))) {
            creep.checkpointsCrossed++;
        }
        else {
            let targetIndexInSegment = currentIndexInSegment+1;
            let targetPx = getTileCenterPx(activeSegment[targetIndexInSegment], this.board.config.tilePixelDim);
            this.moveTowards(creep, targetPx);
        }
    }

    moveTowards(creep: ActiveCreep, targetPosPx: PixelCoordinate) {
        creep.pxPos = findNewPosition(creep.pxPos, targetPosPx, creep.velocityPxPerFrame);
    }

    public hurtCreep(id: string, dmg: number) {
        let targetCreep = this.wave.activeCreeps.find(creep => creep.id === id);
        //Creep could have been removed in projectile travel.
        if (targetCreep) {
            targetCreep.health -= dmg;
            if (targetCreep.health <= 0) this.removeActiveCreep(id);
        }
    }
    
    moreCreepsToAdd(): boolean {
        return this.nextCreepIdx < this.wave.creeps.length;
    }

    stepFrame() {
        this.moveActiveCreeps();
        this.framesTillNextCreep--;
        if (this.framesTillNextCreep === 0 && this.moreCreepsToAdd()) {
            this.addNextCreep();
            this.framesTillNextCreep = this.wave.config.creepFrameSeparation;
        }
        if (this.creepsRemoved === this.wave.creeps.length) {
            this.orchestrator.endWave();
        }
        else {
            //todo tower management should be independent. so that towers can reload between waves.
            this.stepFrameForTowers();
            this.projectileTracker.moveProjectiles();
        }
    }

    public creepIsInWave(id: string): boolean {
        return this.wave.activeCreeps.some(activeCreep => id === activeCreep.id);
    }

    public creepIsTargettable(tower: Tower, creep: ActiveCreep, dim: number) {
        return creepIsInRange(tower, creep, dim) && this.creepIsInWave(creep.id);
    }

    public stepFrameForTowers() {
        this.board.towers.forEach((tower) => {
            if (tower.framesReloading > 0) tower.framesReloading--;
            if (tower.targettedCreep && 
                !this.creepIsTargettable(tower,tower.targettedCreep,this.board.config.tilePixelDim)) {
                tower.targettedCreep = undefined;
            }
            if (!tower.targettedCreep) 
                this.tryToTargetCreep(tower, this.wave.activeCreeps);
            
            if (tower.targettedCreep && tower.framesReloading <= 0) {
                this.projectileTracker.addProjectile(new Projectile(tower, tower.targettedCreep,
                    tower.type.projectileConfig));
                //TODO effective value.
                tower.framesReloading = tower.type.baseFramesPerAttk;
            }
        });
    }

    tryToTargetCreep(tower: Tower, activeCreeps: ActiveCreep[]) {
        let targetableCreep: ActiveCreep | undefined = firstInRange(tower, activeCreeps, this.board.config.tilePixelDim);
        if (targetableCreep) tower.targettedCreep = targetableCreep;
    }
}

export const creepIsInRange = (tower: Tower, creep: ActiveCreep, dim: number): boolean => {
    //TODO effective.
    return calculateDistance(getTileCenterPx(tower.pos,dim),creep.pxPos) 
        <= tower.type.baseRangePx;
}


export const firstInRange = (tower: Tower, activeCreeps: ActiveCreep[], dim: number): ActiveCreep | undefined => {
    return activeCreeps.filter((creep) => creepIsInRange(tower,creep,dim))
        ?.[0];
}
