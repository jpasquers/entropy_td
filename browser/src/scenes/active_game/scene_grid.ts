import { GameInstanceConfiguration } from "entropy-td-core";
import { ActiveGameScene } from ".";
import { BG_COLOR, BORDER_COLOR, COMMAND_CARD_HEIGHT, COMMAND_CARD_WIDTH } from "../../display_configs";
import { BasicSceneGrid, GRID_BORDER_THICKNESS, toExternalDim } from "../../phaser/extensions/scene_grid";
import { BorderedSubScene, SubScene } from "../../phaser/extensions/sub_scene";

export const NAVIGATION_INTERNAL_HEIGHT = 100;

export class ActiveGameSceneGrid extends BasicSceneGrid {
    gameplaySection: SubScene;
    navigationSection: BorderedSubScene;
    commandCardSection: BorderedSubScene;

    GAMEPLAY_INTERNAL_WIDTH: number;
    GAMEPLAY_INTERNAL_HEIGHT: number;
    NAVIGATION_INTERNAL_WIDTH: number;


    
    constructor(scene: ActiveGameScene) {
        super();
        this.GAMEPLAY_INTERNAL_HEIGHT = getInternalGameplayHeight(scene.gameController.config);
        this.GAMEPLAY_INTERNAL_WIDTH = getInternalGameplayWidth(scene.gameController.config);
        this.NAVIGATION_INTERNAL_WIDTH = this.GAMEPLAY_INTERNAL_WIDTH;
        this.gameplaySection = {
            id: "activegame_gameplay",
            scene: scene,
            internalOffset: {
                pxCol: GRID_BORDER_THICKNESS,
                pxRow: toExternalDim(NAVIGATION_INTERNAL_HEIGHT)
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
            internalWidth: scene.getViewportWidth() - 2*GRID_BORDER_THICKNESS,
            border: {
                color: BORDER_COLOR,
                width: GRID_BORDER_THICKNESS
            },
            filled: BG_COLOR,
            fixed: true
        }
        this.commandCardSection = {
            id: "activegame_commandcard",
            scene: scene,
            internalOffset: {
                pxCol: scene.getViewportWidth() - (COMMAND_CARD_WIDTH + GRID_BORDER_THICKNESS),
                pxRow: scene.getViewportHeight() - (COMMAND_CARD_HEIGHT + GRID_BORDER_THICKNESS)
            },
            internalHeight: COMMAND_CARD_HEIGHT,
            internalWidth: COMMAND_CARD_WIDTH,
            border: {
                color: BORDER_COLOR,
                width: GRID_BORDER_THICKNESS
            },
            filled: BG_COLOR,
            fixed: true
        }
    }

    getSections(): (SubScene | BorderedSubScene)[] {
        return [
            this.navigationSection,
            this.gameplaySection,
            this.commandCardSection
        ]
    }
}


export const getInternalGameplayHeight = (config: GameInstanceConfiguration): number => {
    return config.tilePixelDim * config.tilesRowCount
}

export const getExternalGameplayHeight = (config: GameInstanceConfiguration): number => {
    return getInternalGameplayHeight(config);
}

export const getInternalGameplayWidth = (config: GameInstanceConfiguration): number => {
    return config.tilePixelDim * config.tilesColCount;
}

export const getExternalGameplayWidth = (config: GameInstanceConfiguration): number => {
    return getInternalGameplayWidth(config);
}

export const getActiveGameExternalHeight = (config: GameInstanceConfiguration): number => {
    return getExternalGameplayHeight(config) + 
        toExternalDim(NAVIGATION_INTERNAL_HEIGHT) + 
        toExternalDim(COMMAND_CARD_HEIGHT)
}

export const getActiveGameExternalWidth = (config: GameInstanceConfiguration): number => {
    return getExternalGameplayWidth(config);
}