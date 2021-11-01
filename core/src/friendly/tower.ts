import { getTileCenterPx } from "../common/utils";
import { ConfigType, TowerType } from "../config";
import { ActiveCreep } from "../enemy/creep";
import { Coordinate, PixelCoordinate } from "../game_board";
let GLOBAL_ID = 0;
export interface TowerSummary {
    type: TowerType;
    pos: Coordinate;
    pxCenter: PixelCoordinate;
    id: string;
    framesReloading: number;
    targettedCreep?: ActiveCreep;
}

export type DamageModifier = (input: number) => number;

export interface Upgrade {
    canPurchase: boolean;
    cost: number | undefined;
}

export interface OneoffUpgrade extends Upgrade {
    purchased: boolean;
}

export interface ConsistentUpgrade {
    currentLevel: number;
}

export class LiveTower implements TowerSummary {
    type: TowerType;
    pos: Coordinate;
    pxCenter: PixelCoordinate;
    id: string;
    framesReloading: number;
    targettedCreep?: ActiveCreep;

    constructor(pos: Coordinate, tileDim: number, towerType: TowerType) {
        this.type = towerType;
        this.pos = pos;
        this.pxCenter = getTileCenterPx(pos,tileDim);
        this.id = (GLOBAL_ID++).toString();
        this.framesReloading = 0;
    }
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