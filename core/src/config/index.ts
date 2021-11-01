import { PlayerStateConfiguration } from "../friendly/player";
import { ProjectileConfig } from "../friendly/projectile";
import { GameBoardConfiguration } from "../game_board";
import { TimelineConfiguration } from "../timeline";
export interface ConfigType {}

export interface GameInstanceConfiguration extends GameBoardConfiguration, TimelineConfiguration, PlayerStateConfiguration {
    towerTypes: Record<string, TowerType>;
}

export type CostCalculator = (instance: number) => number;

export interface ScalingCostConfig extends ConfigType {
    base: number;
    mult: number;
    exp: number;
}

export interface TowerType extends ConfigType{
    name: string;
    enabled: boolean;
    hotkey: string;
    baseCost: number;
    baseDamage: number;
    baseFramesPerAttk: number;
    baseRangePx: number;
    projectileConfig: ProjectileConfig;
    potentialUpgrades: UpgradeConfig[];
}


export interface UpgradeConfig {
    canPurchase: boolean;
    cost: ScalingCostConfig;
    mode: "ONE_TIME" | "INCREMENTAL";
    type: "DAMAGE" | "RANGE" | "ATTK_SPEED";
}

export const ScalingCostCalculator = ({base,mult,exp}: ScalingCostConfig): CostCalculator => {
    return (instance: number) => {
        return base + Math.pow(mult*instance, exp);
    }
}