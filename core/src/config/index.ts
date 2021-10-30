import { PlayerStateConfiguration } from "../friendly/player";
import { TowerType } from "../friendly/tower";
import { GameBoardConfiguration } from "../game_board";
import { TimelineConfiguration } from "../timeline";

export interface InstanceGameConfiguration extends GameBoardConfiguration, TimelineConfiguration, PlayerStateConfiguration {
    towerTypes: Record<string, TowerType>;
}

export interface InstanceUpgradeCostConfig {
    base: number;
    mult: number;
    exp: number;
}
