import { GameConfiguration } from "entropy-td-core/lib/orchestrator";
import { ActiveGameScene } from ".";
import { COMMAND_CARD_HEIGHT, COMMAND_CARD_WIDTH } from "../../display_configs";
import { SceneGrid, GRID_BORDER_THICKNESS, toExternalDim } from "../../phaser/extensions/scene_grid";
import { BorderedSubScene } from "../../phaser/extensions/sub_scene";

export const NAVIGATION_INTERNAL_HEIGHT = 100;

export class ActiveGameSceneGrid implements SceneGrid {
    gameplaySection: BorderedSubScene;
    navigationSection: BorderedSubScene;
    commandCardSection: BorderedSubScene;

    GAMEPLAY_INTERNAL_WIDTH: number;
    GAMEPLAY_INTERNAL_HEIGHT: number;
    NAVIGATION_INTERNAL_WIDTH: number;


    
    constructor(scene: ActiveGameScene) {
        this.GAMEPLAY_INTERNAL_HEIGHT = getInternalGameplayHeight(scene.gameController.config);
        this.GAMEPLAY_INTERNAL_WIDTH = getInternalGameplayWidth(scene.gameController.config);
        this.NAVIGATION_INTERNAL_WIDTH = this.GAMEPLAY_INTERNAL_WIDTH;
        this.gameplaySection = {
            id: "activegame_gameplay",
            scene: scene,
            internalOffset: {
                pxCol: GRID_BORDER_THICKNESS,
                pxRow: toExternalDim(NAVIGATION_INTERNAL_HEIGHT) + GRID_BORDER_THICKNESS
            },
            internalHeight: this.GAMEPLAY_INTERNAL_HEIGHT,
            internalWidth: this.GAMEPLAY_INTERNAL_WIDTH,
        }
        this.navigationSection = {
            id: "activegame_navigation",
            scene: scene,
            internalOffset: {
                pxCol: GRID_BORDER_THICKNESS,
                pxRow: GRID_BORDER_THICKNESS
            },
            internalHeight: NAVIGATION_INTERNAL_HEIGHT,
            internalWidth: this.GAMEPLAY_INTERNAL_WIDTH
        }
        this.commandCardSection = {
            id: "activegame_commandcard",
            scene: scene,
            internalOffset: {
                pxCol: toExternalDim(this.GAMEPLAY_INTERNAL_WIDTH) - toExternalDim(COMMAND_CARD_WIDTH) + GRID_BORDER_THICKNESS,
                pxRow: toExternalDim(this.GAMEPLAY_INTERNAL_HEIGHT) + toExternalDim(NAVIGATION_INTERNAL_HEIGHT) + GRID_BORDER_THICKNESS
            },
            internalHeight: COMMAND_CARD_HEIGHT,
            internalWidth: COMMAND_CARD_WIDTH
        }
    }

    getSections(): BorderedSubScene[] {
        return [
            this.navigationSection,
            this.gameplaySection,
            this.commandCardSection
        ]
    }
}


export const getInternalGameplayHeight = (config: GameConfiguration): number => {
    return config.tilePixelDim * config.tilesRowCount
}

export const getExternalGameplayHeight = (config: GameConfiguration): number => {
    return getInternalGameplayHeight(config) + 2*GRID_BORDER_THICKNESS;
}

export const getInternalGameplayWidth = (config: GameConfiguration): number => {
    return config.tilePixelDim * config.tilesColCount;
}

export const getExternalGameplayWidth = (config: GameConfiguration): number => {
    return getInternalGameplayWidth(config) + 2*GRID_BORDER_THICKNESS;
}

export const getActiveGameExternalHeight = (config: GameConfiguration): number => {
    return getExternalGameplayHeight(config) + 
        toExternalDim(NAVIGATION_INTERNAL_HEIGHT) + 
        toExternalDim(COMMAND_CARD_HEIGHT)
}

export const getActiveGameExternalWidth = (config: GameConfiguration): number => {
    return getExternalGameplayWidth(config);
}