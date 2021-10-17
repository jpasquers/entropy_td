import { getTileCenterPx } from "../common/utils";
import { ActiveCreep } from "../enemy/creep";
import { Coordinate, PixelCoordinate } from "../game_board";
import { ProjectileConfig, SimpleProjectile } from "./projectile";
let GLOBAL_ID = 0;
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

export const fromTowerType = (pos: Coordinate, tileDim: number, towerType: TowerType): Tower => {
    return {
        type: {
            name: "simple_1",
            enabled: true,
            hotkey: "a",
            baseCost: 10,
            baseDamage: 25,
            baseFramesPerAttk: 25,
            baseRangePx: 150,
            projectileConfig: SimpleProjectile
        },
        framesReloading: 0,
        id: (GLOBAL_ID++).toString(),
        pos: pos,
        pxCenter: getTileCenterPx(pos, tileDim)
    }
}