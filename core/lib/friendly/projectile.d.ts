import { ActiveCreep } from "../enemy/creep";
import { PixelCoordinate } from "../game_board";
import { Tower } from "./tower";
export interface ProjectileSummary {
    id: string;
    pxPos: PixelCoordinate;
}
export declare class Projectile implements ProjectileSummary {
    srcTower: Tower;
    targetCreep: ActiveCreep;
    pxPos: PixelCoordinate;
    config: ProjectileConfig;
    id: string;
    constructor(tower: Tower, activeCreep: ActiveCreep, config: ProjectileConfig);
    moveFrame(): void;
    getSummary(): {
        id: string;
        pxPos: PixelCoordinate;
    };
}
export declare enum ProjectileType {
    SmallCircle = "small_circle"
}
export declare const SimpleProjectile: ProjectileConfig;
export interface ProjectileConfig {
    speedPxPerFrame: number;
}
