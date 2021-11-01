import { getTileCenterPx } from "../common/utils";
import { ConfigType, TowerType } from "../config";
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



export const fromTowerType = (pos: Coordinate, tileDim: number, towerType: TowerType): Tower => {
    return {
        type: towerType,
        framesReloading: 0,
        id: (GLOBAL_ID++).toString(),
        pos: pos,
        pxCenter: getTileCenterPx(pos, tileDim)
    }
}