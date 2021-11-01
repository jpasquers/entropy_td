import { ConfigType, GameInstanceConfiguration, ScalingCostConfig, TowerType } from "..";
import { ProjectileConfig } from "../../friendly/projectile";
import { RandomizableRange } from "../calc";


export type Randomizable<T> = {
    [K in keyof T]: T[K] extends number ? RandomizableRange : 
        T[K] extends ConfigType ? Randomizable<T[K]> : K;
}

export type GlobalScalingCostConfig = Randomizable<ScalingCostConfig>;


export interface GlobalGameConfiguration extends Randomizable<GameInstanceConfiguration> {
    towerTypes: Record<string, GlobalTowerType>;
}

export type GlobalTowerType = Randomizable<TowerType>;