import { ProjectileConfig } from "../../friendly/projectile";
import { RandomizableRange } from "../calc";

export interface GlobalGameConfiguration {
    tileColumnCount: RandomizableRange;
    towerTypes: Record<string, GlobalTowerTypeConfig>;
}

export interface GLobalUpgradeCostConfig {
    base: RandomizableRange;
    mult: RandomizableRange;
    exp: RandomizableRange;
}

export interface GlobalTowerTypeConfig {
    name: string;
    enabled: boolean;
    hotkey: string;
    baseCost: RandomizableRange;
    baseDamage: RandomizableRange;
    baseFramesPerAttk: number;
    baseRangePx: number;
    projectileConfig: ProjectileConfig;
}