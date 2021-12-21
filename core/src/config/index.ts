import { Dim2D } from "../gameboard/game_board";
import * as defaults from "./global.json";
import {deRandomize, FullDeRandomized, RandomizableCount, RandomizableRange} from "config-randomizer";

export interface ConfigType {} 


export interface RandomizableGameBoardConfiguration 
    extends RandomizableBonusIncomeTilesConfiguration,
        RandomizableNoBuildBlockersConfiguration {
    tilesColCount: RandomizableRange | number;
    tilesRowCount: RandomizableRange | number;
    tilePixelDim: RandomizableRange | number;
    rockCount: RandomizableRange | number;
    checkpointCount: RandomizableRange | number;
}

export type GameBoardConfiguration = FullDeRandomized<RandomizableGameBoardConfiguration>;

export interface RandomizableNoBuildBlockersConfiguration {
    noBuildBlockers: RandomizableCount<RandomizableNoBuildBlockerConfiguration>;
}

export interface RandomizableNoBuildBlockerConfiguration {
    dim: RandomizableRange;
}

export type NoBuilderBlockersConfiguration = FullDeRandomized<RandomizableNoBuildBlockersConfiguration>;

export interface RandomizableBonusIncomeTilesConfiguration {
    bonusIncomeTiles: RandomizableCount<RandomizableBonusIncomeTileConfiguration>;
}

export interface RandomizableBonusIncomeTileConfiguration {
    waveMultValue: RandomizableRange;
}

export type BonusIncomeTilesConfiguration = FullDeRandomized<RandomizableBonusIncomeTilesConfiguration>;

export interface RandomizableTimelineConfiguration {
    timeBeforeFirstWaveSec: RandomizableRange | number;
    timeBetweenWavesSec: RandomizableRange | number;
}

export type TimelineConfiguration = FullDeRandomized<RandomizableTimelineConfiguration>;

export interface RandomizableProjectileConfig {
    speedPxPerFrame: RandomizableRange | number;
}

export type ProjectileConfig = FullDeRandomized<RandomizableProjectileConfig>;


export interface RandomizableScalingValue extends ConfigType {
    base: RandomizableRange | number;
    mult: RandomizableRange | number;
    exp: RandomizableRange | number;
}

export type ScalingValue = FullDeRandomized<RandomizableScalingValue>;

export const isScalingValue = (val: number | ScalingValue):val is ScalingValue => {
    return typeof val === "object" && 
        "base" in val && 
        "mult" in val &&
        "exp" in val;
}

export interface RandomizablePctEffectiveness {
    pct: RandomizableRange | number;
}

export type PctEffectiveness = FullDeRandomized<RandomizablePctEffectiveness>;

export interface RandomizableFlatEffectiveness {
    flat: RandomizableRange | number;
}

export type FlatEffectiveness = FullDeRandomized<RandomizableFlatEffectiveness>;

export interface RandomizableScalingEffectiveness {
    scale: RandomizableScalingValue;
}

export type ScalingEffectiveness = FullDeRandomized<RandomizableScalingEffectiveness>;

export interface RandomizableUpgradeConfig {
    purchasable: boolean;
    type: string;
    //Effectiveness is per upgrade if incremental.
    effectiveness: RandomizablePctEffectiveness | RandomizableFlatEffectiveness | RandomizableScalingEffectiveness;
}

export type UpgradeConfig = FullDeRandomized<RandomizableUpgradeConfig>;

export interface RandomizableOneTimeUpgradeConfig extends RandomizableUpgradeConfig {
    cost: RandomizableRange | number;
}

export type OneTimeUpgradeConfig = FullDeRandomized<RandomizableOneTimeUpgradeConfig>;

export interface RandomizableIncrementalUpgradeConfig extends RandomizableUpgradeConfig{
    cost: RandomizableScalingValue;
}

export type IncrementalUpgradeConfig = FullDeRandomized<RandomizableIncrementalUpgradeConfig>;

export const isIncremental = (config: IncrementalUpgradeConfig | OneTimeUpgradeConfig): config is IncrementalUpgradeConfig => {
    return isScalingValue(config.cost);
}

export interface RandomizableTowerType extends ConfigType{
    name: string;
    enabled: boolean;
    hotkey: string;
    dim: Dim2D;
    baseCost: RandomizableRange | number;
    baseDamage: RandomizableRange | number;
    baseFramesPerAttk: RandomizableRange | number;
    baseRangePx: RandomizableRange | number;
    projectileConfig: RandomizableProjectileConfig;
    potentialUpgrades: (RandomizableOneTimeUpgradeConfig | RandomizableIncrementalUpgradeConfig)[];
}

export type TowerType = FullDeRandomized<RandomizableTowerType>;


export interface RandomizableTowerConfiguration extends ConfigType {
    towerTypes: Record<string, RandomizableTowerType>;
}



export interface RandomizablePlayerStateConfiguration {
    startingMoney: RandomizableRange | number;
}

export type PlayerStateConfiguration = FullDeRandomized<RandomizablePlayerStateConfiguration>;

export interface RandomizableGameConfiguration extends 
    RandomizableGameBoardConfiguration,
    RandomizableTimelineConfiguration,
    RandomizablePlayerStateConfiguration,
    RandomizableTowerConfiguration,
    ConfigType {}


export type GameInstanceConfiguration = FullDeRandomized<RandomizableGameConfiguration>;

export const ALL_TOWER_TYPES = Object.keys(defaults.towerTypes);

export const generateGameConfiguration = (): GameInstanceConfiguration => {
    let globalConfig: RandomizableGameConfiguration = defaults;
    return deRandomize<RandomizableGameConfiguration>(globalConfig);
}