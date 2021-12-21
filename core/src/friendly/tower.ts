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
    currentUpgrades: Upgrade[];
    availableUpgrades: Upgrade[];

    constructor(tlCoord: Coordinate, towerType: TowerType) {
        super(tlCoord, towerType.dim);
        this.type = towerType;
        this.tlCoord = tlCoord;
        this.id = (GLOBAL_ID++).toString();
        this.framesReloading = 0;
        this.currentUpgrades = [];
        this.availableUpgrades = availableUpgradesFromConfig(towerType.potentialUpgrades);
    }


    public getOutboundDamageInstance(): number {
        return this.type.baseDamage;
    }
}