import { TILE_SIZE_PX } from "..";
import { getPxCenter } from "../common/utils";
import { ConfigType, IncrementalUpgradeConfig, isIncremental, OneTimeUpgradeConfig, TowerType, UpgradeConfig } from "../config";
import { ActiveCreep } from "../enemy/creep";
import { Coordinate, Dim2D, PixelCoordinate } from "../gameboard/game_board";
import { OccupiesBoard } from "../gameboard/model";
let GLOBAL_ID = 0;
export interface TowerSummary {
    type: TowerType;
    tlCoord: Coordinate;
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

export interface Stats {
    damage: number;
    attkSpeed: number;
    range: number;
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

export class LiveTower extends OccupiesBoard  implements TowerSummary {
    type: TowerType;
    id: string;
    framesReloading: number;
    targettedCreep?: ActiveCreep;
    upgrades: Upgrade[];
    baseStats: Stats;
    currentStats!: Stats;

    constructor(tlCoord: Coordinate, towerType: TowerType) {
        super(tlCoord, towerType.dim);
        this.type = towerType;
        this.tlCoord = tlCoord;
        this.id = (GLOBAL_ID++).toString();
        this.framesReloading = 0;
        this.upgrades = availableUpgradesFromConfig(towerType.potentialUpgrades);
        this.baseStats = {
            damage: towerType.baseDamage,
            attkSpeed: towerType.baseFramesPerAttk,
            range: towerType.baseRangePx / TILE_SIZE_PX
        }
        this.synchronizeStats();
    }

    public synchronizeStats(): void {
        this.currentStats = this.applyModifiers(this.applyUpgrades(this.baseStats));
    }

    public applyUpgrades(inBound: Stats): Stats {
        return inBound;
    }

    public applyModifiers(inBound: Stats): Stats {
        return inBound;
    }
}