import { PixelCoordinate } from "entropy-td-core";
import { GameInstanceConfiguration } from "entropy-td-core";
import { getActiveGameExternalHeight, getActiveGameExternalWidth } from "./active_game/scene_grid";

export const getEffectiveGameHeight = (config: GameInstanceConfiguration) => {
    return getActiveGameExternalHeight(config);
}

export const getEffectiveGameWidth = (config: GameInstanceConfiguration) => {
    return getActiveGameExternalWidth(config);
}