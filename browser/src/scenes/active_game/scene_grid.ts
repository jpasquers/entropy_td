import { GameInstanceConfiguration } from "entropy-td-core";
import { ActiveGameScene } from ".";
import { FIXED_LAYER, GRID_LAYER } from "../../common/z_layers";
import { BG_COLOR, BORDER_COLOR, COMMAND_CARD_HEIGHT, COMMAND_CARD_WIDTH } from "../../display_configs";
import { BasicSceneGrid, GRID_BORDER_THICKNESS, toExternalDim, toExternalOffset } from "../../phaser/extensions/scene_grid";
import { CameraFixedSubScene, SubScene, WorldFixedSubScene } from "../../phaser/extensions/sub_scene";
import { HudScene } from "../hud";

export const NAVIGATION_INTERNAL_HEIGHT = 100;

export class ActiveGameWorldGrid extends BasicSceneGrid<SubScene> {
    gameplaySection: SubScene;

    GAMEPLAY_INTERNAL_WIDTH: number;
    GAMEPLAY_INTERNAL_HEIGHT: number;

    getSections(): SubScene[] {
        throw new Error("Method not implemented.");
    }
    constructor(scene: ActiveGameScene) {
        super();
        this.GAMEPLAY_INTERNAL_HEIGHT = getInternalGameplayHeight(scene.gameController.config);
        this.GAMEPLAY_INTERNAL_WIDTH = getInternalGameplayWidth(scene.gameController.config);
        this.gameplaySection = {
            id: "activegame_gameplay",
            scene: scene,
            externalOffset: {
                pxCol: GRID_BORDER_THICKNESS,
                pxRow: NAVIGATION_INTERNAL_HEIGHT + 2*GRID_BORDER_THICKNESS
            },
            externalHeight: this.GAMEPLAY_INTERNAL_HEIGHT + 2*GRID_BORDER_THICKNESS,
            externalWidth: this.GAMEPLAY_INTERNAL_WIDTH + 2*GRID_BORDER_THICKNESS,
            layer: GRID_LAYER
        }
    }
    
}

export class ActiveGameHudGrid extends BasicSceneGrid<SubScene> {
    notificationSection: SubScene;
    navigationSection: SubScene;
    commandCardSection: SubScene;

    GAMEPLAY_INTERNAL_WIDTH: number;
    GAMEPLAY_INTERNAL_HEIGHT: number;
    NAVIGATION_INTERNAL_WIDTH: number;


    
    constructor(scene: HudScene) {
        super();
        this.GAMEPLAY_INTERNAL_HEIGHT = getInternalGameplayHeight(scene.gameController.config);
        this.GAMEPLAY_INTERNAL_WIDTH = getInternalGameplayWidth(scene.gameController.config);
        this.NAVIGATION_INTERNAL_WIDTH = this.GAMEPLAY_INTERNAL_WIDTH;
        this.navigationSection = {
            id: "activegame_navigation",
            scene: scene,
            externalOffset: {
                pxCol: GRID_BORDER_THICKNESS,
                pxRow: GRID_BORDER_THICKNESS
            },
            externalHeight: NAVIGATION_INTERNAL_HEIGHT + 2*GRID_BORDER_THICKNESS,
            externalWidth: scene.getViewportWidth(),
            border: {
                color: BORDER_COLOR,
                width: GRID_BORDER_THICKNESS
            },
            filled: BG_COLOR,
            layer: FIXED_LAYER
        }
        this.notificationSection = {
            id: "activegame_notification",
            scene: scene,
            externalOffset: {
                pxCol: 0,
                pxRow: toExternalDim(NAVIGATION_INTERNAL_HEIGHT) + 100
            },
            externalHeight: 200,
            externalWidth: scene.getViewportWidth(),
            layer: FIXED_LAYER
        }
        this.commandCardSection = {
            id: "activegame_commandcard",
            scene: scene,
            externalOffset: {
                pxCol: scene.getViewportWidth() - (COMMAND_CARD_WIDTH + GRID_BORDER_THICKNESS),
                pxRow: scene.getViewportHeight() - (COMMAND_CARD_HEIGHT + GRID_BORDER_THICKNESS)
            },
            externalHeight: COMMAND_CARD_HEIGHT + 2*GRID_BORDER_THICKNESS,
            externalWidth: COMMAND_CARD_WIDTH + 2*GRID_BORDER_THICKNESS,
            border: {
                color: BORDER_COLOR,
                width: GRID_BORDER_THICKNESS
            },
            filled: BG_COLOR,
            layer: FIXED_LAYER
        }
    }

    getSections(): SubScene[] {
        return [
            this.navigationSection,
            this.commandCardSection,
            this.notificationSection
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