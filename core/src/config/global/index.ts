import { ConfigType, GameInstanceConfiguration, ScalingValue, TowerType } from "..";
import { ConfigWithOptionalMappedSubType, unmapLeafType } from "../../common/utils";
import { ProjectileConfig } from "../../friendly/projectile";
import { choose, isRandomizableRange, RandomizableRange } from "../calc";
import defaults from "./global.json";


export type Randomizable<T extends ConfigType> = ConfigWithOptionalMappedSubType<T,number,RandomizableRange>;

export type RandomizableScalingValue = Randomizable<ScalingValue>;


export type GlobalGameConfiguration = Randomizable<GameInstanceConfiguration>;

export type GlobalTowerType = Randomizable<TowerType>;

export const ALL_TOWER_TYPES = Object.keys(defaults.towerTypes);

export const generateGameConfiguration = (): GameInstanceConfiguration => {
    let globalConfig: GlobalGameConfiguration = defaults;
    return unmapLeafType<RandomizableRange,number>(globalConfig,
        (range:RandomizableRange) => {
            return choose(range);
        }, isRandomizableRange);
}