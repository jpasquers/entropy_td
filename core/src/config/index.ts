import { PlayerStateConfiguration } from "../friendly/player";
import { ProjectileConfig } from "../friendly/projectile";
import { GameBoardConfiguration } from "../game_board";
import { TimelineConfiguration } from "../timeline";
export interface ConfigType {}

export interface GameInstanceConfiguration extends GameBoardConfiguration, TimelineConfiguration, PlayerStateConfiguration {
    towerTypes: Record<string, TowerType>;
}

export type CostCalculator = (instance: number) => number;

export interface ScalingValue extends ConfigType {
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
    potentialUpgrades: (OneTimeUpgradeConfig | IncrementalUpgradeConfig)[];
}

export interface PctEffectiveness {
    pct: number;
}

export interface FlatEffectiveness {
    flat: number;
}

export interface ScalingEffectiveness {
    scale: ScalingValue;
}


export interface UpgradeConfig {
    purchasable: boolean;
    type: "DAMAGE" | "RANGE" | "ATTK_SPEED";
    //Effectiveness is per upgrade if incremental.
    effectiveness: PctEffectiveness | FlatEffectiveness | ScalingEffectiveness;
}

export interface OneTimeUpgradeConfig extends UpgradeConfig {
    cost: number;
}

export interface IncrementalUpgradeConfig extends UpgradeConfig{
    cost: ScalingValue;
}

export const isScalingCost = (val: number | ScalingValue): val is ScalingValue => {
    return !(typeof val === "number");
}

export const isIncremental = (val: OneTimeUpgradeConfig | IncrementalUpgradeConfig): val is IncrementalUpgradeConfig => {
    return isScalingCost(val.cost);
}

export const ScalingCostCalculator = ({base,mult,exp}: ScalingValue): CostCalculator => {
    return (instance: number) => {
        return base + Math.pow(mult*instance, exp);
    }
}