import { getTileCenterPx } from "../common/utils";
import { ConfigType, IncrementalUpgradeConfig, isIncremental, OneTimeUpgradeConfig, TowerType, UpgradeConfig } from "../config";
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

export type Upgrade = OneTimeUpgrade | IncrementalUpgrade;

export interface OneTimeUpgrade {
    purchased: boolean;
    config: OneTimeUpgradeConfig;
}

export interface IncrementalUpgrade {
    currentLevel: number;
    config: IncrementalUpgradeConfig;
}

const availableUpgradesFromConfig = (upgradeConfigs: (OneTimeUpgradeConfig | IncrementalUpgradeConfig)[]): Upgrade[] => {
    return upgradeConfigs.map((config) => {
        if (isIncremental(config)) return {
            currentLevel: 0,
            config: config
        }
        else {
            return {
                purchased: false,
                config: config
            }
        }
    })
}

export class LiveTower implements TowerSummary {
    type: TowerType;
    pos: Coordinate;
    pxCenter: PixelCoordinate;
    id: string;
    framesReloading: number;
    targettedCreep?: ActiveCreep;
    currentUpgrades: Upgrade[];
    availableUpgrades: Upgrade[];

    constructor(pos: Coordinate, tileDim: number, towerType: TowerType) {
        this.type = towerType;
        this.pos = pos;
        this.pxCenter = getTileCenterPx(pos,tileDim);
        this.id = (GLOBAL_ID++).toString();
        this.framesReloading = 0;
        this.currentUpgrades = [];
        this.availableUpgrades = availableUpgradesFromConfig(towerType.potentialUpgrades);
    }

    public getOutboundDamageInstance(): number {
        return this.type.baseDamage;
    }
}