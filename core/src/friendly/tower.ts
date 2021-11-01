import { getTileCenterPx } from "../common/utils";
import { ConfigType, TowerType, UpgradeConfig } from "../config";
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
    effectiveDamage: number;
}

export type DamageModifier = (input: number) => number;

export interface Upgrade {
    config: UpgradeConfig;
}

export interface OneTimeUpgrade extends Upgrade {
    purchased: boolean;
}

export interface IncrementalUpgrade extends Upgrade {
    currentLevel: number;
}

export class LiveTower implements TowerSummary {
    type: TowerType;
    pos: Coordinate;
    pxCenter: PixelCoordinate;
    id: string;
    framesReloading: number;
    targettedCreep?: ActiveCreep;
    effectiveDamage: number;

    constructor(pos: Coordinate, tileDim: number, towerType: TowerType) {
        this.type = towerType;
        this.pos = pos;
        this.pxCenter = getTileCenterPx(pos,tileDim);
        this.id = (GLOBAL_ID++).toString();
        this.framesReloading = 0;
        this.effectiveDamage = towerType.baseDamage;
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