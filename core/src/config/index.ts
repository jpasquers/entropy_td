import { ConfigWithOptionalMappedSubType, ConfigWithStrictMappedSubType } from "../common/utils";
import { choose, isRandomizableRange, RandomizableRange } from "./calc";
import * as defaults from "./global.json";

export interface ConfigType {} 

export type Randomizable<T extends ConfigType> = ConfigWithOptionalMappedSubType<T,number,RandomizableRange>;
export type DeRandomized<T extends ConfigType> = ConfigWithStrictMappedSubType<T,RandomizableRange,number>;

export interface RandomizableGameBoardConfiguration {
    tilesColCount: RandomizableRange | number;
    tilesRowCount: RandomizableRange | number;
    tilePixelDim: RandomizableRange | number;
    density: RandomizableRange | number;
    checkpointCount: RandomizableRange | number;
}

export type GameBoardConfiguration = DeRandomized<RandomizableGameBoardConfiguration>;

export interface RandomizableTimelineConfiguration {
    timeBeforeFirstWaveSec: RandomizableRange | number;
    timeBetweenWavesSec: RandomizableRange | number;
}

export type TimelineConfiguration = DeRandomized<RandomizableTimelineConfiguration>;

export interface RandomizableProjectileConfig {
    speedPxPerFrame: RandomizableRange | number;
}

export type ProjectileConfig = DeRandomized<RandomizableProjectileConfig>;


export interface RandomizableScalingValue extends ConfigType {
    base: RandomizableRange | number;
    mult: RandomizableRange | number;
    exp: RandomizableRange | number;
}

export type ScalingValue = DeRandomized<RandomizableScalingValue>;

export const isScalingValue = (val: number | ScalingValue):val is ScalingValue => {
    return typeof val === "object" && 
        "base" in val && 
        "mult" in val &&
        "exp" in val;
}

export interface RandomizablePctEffectiveness {
    pct: RandomizableRange | number;
}

export type PctEffectiveness = DeRandomized<RandomizablePctEffectiveness>;

export interface RandomizableFlatEffectiveness {
    flat: RandomizableRange | number;
}

export type FlatEffectiveness = DeRandomized<RandomizableFlatEffectiveness>;

export interface RandomizableScalingEffectiveness {
    scale: RandomizableScalingValue;
}

export type ScalingEffectiveness = DeRandomized<RandomizableScalingEffectiveness>;

export interface RandomizableUpgradeConfig {
    purchasable: boolean;
    type: string;
    //Effectiveness is per upgrade if incremental.
    effectiveness: RandomizablePctEffectiveness | RandomizableFlatEffectiveness | RandomizableScalingEffectiveness;
}

export type UpgradeConfig = DeRandomized<RandomizableUpgradeConfig>;

export interface RandomizableOneTimeUpgradeConfig extends RandomizableUpgradeConfig {
    cost: RandomizableRange | number;
}

export type OneTimeUpgradeConfig = DeRandomized<RandomizableOneTimeUpgradeConfig>;

export interface RandomizableIncrementalUpgradeConfig extends RandomizableUpgradeConfig{
    cost: RandomizableScalingValue;
}

export type IncrementalUpgradeConfig = DeRandomized<RandomizableIncrementalUpgradeConfig>;

export const isIncremental = (config: IncrementalUpgradeConfig | OneTimeUpgradeConfig): config is IncrementalUpgradeConfig => {
    return isScalingValue(config.cost);
}

export interface RandomizableTowerType extends ConfigType{
    name: string;
    enabled: boolean;
    hotkey: string;
    //dim: Dim2D;
    baseCost: RandomizableRange | number;
    baseDamage: RandomizableRange | number;
    baseFramesPerAttk: RandomizableRange | number;
    baseRangePx: RandomizableRange | number;
    projectileConfig: RandomizableProjectileConfig;
    potentialUpgrades: (RandomizableOneTimeUpgradeConfig | RandomizableIncrementalUpgradeConfig)[];
}

export type TowerType = DeRandomized<RandomizableTowerType>;


export interface RandomizableTowerConfiguration extends ConfigType {
    towerTypes: Record<string, RandomizableTowerType>;
}



export interface RandomizablePlayerStateConfiguration {
    startingMoney: RandomizableRange | number;
}

export type PlayerStateConfiguration = DeRandomized<RandomizablePlayerStateConfiguration>;

export interface RandomizableGameConfiguration extends 
    RandomizableGameBoardConfiguration,
    RandomizableTimelineConfiguration,
    RandomizablePlayerStateConfiguration,
    RandomizableTowerConfiguration,
    ConfigType {}


export type GameInstanceConfiguration = DeRandomized<RandomizableGameConfiguration>;

export const ALL_TOWER_TYPES = Object.keys(defaults.towerTypes);

export const generateGameConfiguration = (): GameInstanceConfiguration => {
    let globalConfig: RandomizableGameConfiguration = defaults;
    return deRandomize<RandomizableGameConfiguration>(globalConfig);
}


/*
 * Recurses through fields, and every time it finds a field that qualifies as a RandomizableRange,
 * replaces it with a chosen number according to the randomized configuration.
 * 
 * 
 */
 export const deRandomize = <SrcType> (inObj: SrcType): 
        ConfigWithStrictMappedSubType<SrcType,RandomizableRange|number, number> => {
    let out: Record<string|number,any> = {};
    Object.entries(inObj).forEach(([key,value], i) => {
        if (isRandomizableRange(value)) {
            out[key] = choose(value);
        }
        else if (Array.isArray(value)) {
            out[key] = value.map(inner => deRandomize<SrcType>(inner));
        }
        else if (typeof value === 'object') {
            out[key] = deRandomize<SrcType>(value);
        }
        else {
            out[key] = value;
        }
    })
    //Bad practice but this is a very unique circumstance. There is no way to make the TS compiler
    //Understand that we have populated every single field.
    return out as ConfigWithStrictMappedSubType<SrcType,RandomizableRange|number, number>;
}
