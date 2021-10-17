import { findNewPosition } from "../common/utils";
import { ActiveCreep } from "../enemy/creep";
import { PixelCoordinate } from "../game_board";
import { Tower } from "./tower";

export interface ProjectileSummary {
    id: string;
    pxPos: PixelCoordinate;
}


let GLOBAL_ID=0;
export class Projectile implements ProjectileSummary {
    srcTower: Tower;
    targetCreep: ActiveCreep;
    pxPos: PixelCoordinate;
    config: ProjectileConfig;
    id: string;

    constructor(tower: Tower, activeCreep: ActiveCreep, config: ProjectileConfig) {
        this.config = config;
        this.srcTower = tower;
        this.targetCreep = activeCreep;
        this.pxPos = this.srcTower.pxCenter;
        this.id = (GLOBAL_ID++).toString()
    }

    public moveFrame() {
        // TODO: not suk
        this.pxPos = findNewPosition(
            this.pxPos, 
            this.targetCreep.pxPos, 
            this.config.speedPxPerFrame
        );
    }

    public getSummary() {
        return {
            id: this.id,
            pxPos: this.pxPos
        }
    }

}

export enum ProjectileType {
    SmallCircle = "small_circle"
}

export const SimpleProjectile: ProjectileConfig = {
    speedPxPerFrame: 15
}

export interface ProjectileConfig {
    speedPxPerFrame: number;
}