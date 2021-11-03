import { ConfigType, GameInstanceConfiguration, ScalingValue, TowerType } from "..";
import { ProjectileConfig } from "../../friendly/projectile";
import { RandomizableRange } from "../calc";
import defaults from "./global.json";


export type Randomizable<T> = {
    [K in keyof T]: T[K] extends number ? RandomizableRange | number : 
        T[K] extends ConfigType ? Randomizable<T[K]> : K;
}

export type RandomizableScalingValue = Randomizable<ScalingValue>;


export interface GlobalGameConfiguration extends Randomizable<GameInstanceConfiguration> {
    towerTypes: Record<string, GlobalTowerType>;
}

export type GlobalTowerType = Randomizable<TowerType>;

export const ALL_TOWER_TYPES = Object.keys(defaults.towerTypes);

export const generateGameConfiguration = (): GameInstanceConfiguration => {
    let globalConfig: GlobalGameConfiguration = defaults;
}