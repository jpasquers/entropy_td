import { ActiveCreep } from "../enemy/creep";
import { Coordinate, PixelCoordinate } from "../game_board";
import { ProjectileConfig } from "./projectile";
export interface Tower {
    type: TowerType;
    pos: Coordinate;
    pxCenter: PixelCoordinate;
    id: string;
    framesReloading: number;
    targettedCreep?: ActiveCreep;
}
export interface TowerType {
    name: string;
    enabled: boolean;
    hotkey: string;
    baseCost: number;
    baseDamage: number;
    baseFramesPerAttk: number;
    baseRangePx: number;
    projectileConfig: ProjectileConfig;
}
export declare const fromTowerType: (pos: Coordinate, tileDim: number, towerType: TowerType) => Tower;
