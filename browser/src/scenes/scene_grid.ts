import { PixelCoordinate } from "entropy-td-core/lib/game_board";
import { GameConfiguration } from "entropy-td-core/lib/orchestrator";
import { getActiveGameExternalHeight, getActiveGameExternalWidth } from "./active_game/scene_grid";

export const getEffectiveGameHeight = (config: GameConfiguration) => {
    return getActiveGameExternalHeight(config);
}

export const getEffectiveGameWidth = (config: GameConfiguration) => {
    return getActiveGameExternalWidth(config);
}