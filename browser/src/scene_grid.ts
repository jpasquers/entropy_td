import { CustomGameConfiguration, GameConfiguration } from "entropy-td-core/lib/orchestrator";
import { ActiveGameScene } from "./app";
import { BorderedSceneSubSection } from "./renderers";
import { GRID_BORDER_THICKNESS, toExternalDim } from "./renderers/scene_grid";

export interface SceneGrid {
    getSections: ()=>BorderedSceneSubSection[];
}

export const NAVIGATION_INTERNAL_HEIGHT = 100;
export const COMMAND_CARD_INTERNAL_HEIGHT = 100;
export const COMMAND_CARD_INTERNAL_WIDTH = 200;

export class ActiveGameSceneGrid implements SceneGrid{
    gameplaySection: BorderedSceneSubSection;
    navigationSection: BorderedSceneSubSection;
    commandCardSection: BorderedSceneSubSection;

    GAMEPLAY_INTERNAL_WIDTH: number;
    GAMEPLAY_INTERNAL_HEIGHT: number;
    NAVIGATION_INTERNAL_WIDTH: number;


    
    constructor(scene: ActiveGameScene) {
        this.GAMEPLAY_INTERNAL_HEIGHT = ActiveGameSceneGrid.getInternalGameplayHeight(scene.gameController.config);
        this.GAMEPLAY_INTERNAL_WIDTH = ActiveGameSceneGrid.getInternalGameplayWidth(scene.gameController.config);
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
                pxCol: toExternalDim(this.GAMEPLAY_INTERNAL_WIDTH) - toExternalDim(COMMAND_CARD_INTERNAL_WIDTH) + GRID_BORDER_THICKNESS,
                pxRow: toExternalDim(this.GAMEPLAY_INTERNAL_HEIGHT) + toExternalDim(NAVIGATION_INTERNAL_HEIGHT) + GRID_BORDER_THICKNESS
            },
            internalHeight: COMMAND_CARD_INTERNAL_HEIGHT,
            internalWidth: COMMAND_CARD_INTERNAL_WIDTH
        }
    }

    static getInternalGameplayHeight(config: GameConfiguration) {
        return config.tilePixelDim * config.tilesRowCount
    }

    static getExternalGameplayHeight(config: GameConfiguration) {
        return this.getInternalGameplayHeight(config) + 2*GRID_BORDER_THICKNESS;
    }

    static getInternalGameplayWidth(config: GameConfiguration) {
        return config.tilePixelDim * config.tilesColCount;
    }

    static getExternalGameplayWidth(config: GameConfiguration) {
        return this.getInternalGameplayWidth(config) + 2*GRID_BORDER_THICKNESS;
    }

    static getActiveGameExternalHeight(config: GameConfiguration) {
        return this.getExternalGameplayHeight(config) + 
            toExternalDim(NAVIGATION_INTERNAL_HEIGHT) + 
            toExternalDim(COMMAND_CARD_INTERNAL_HEIGHT)
    }

    static getActiveGameExternalWidth(config: GameConfiguration) {
        return this.getExternalGameplayWidth(config);
    }

    getSections(): BorderedSceneSubSection[] {
        return [
            this.navigationSection,
            this.gameplaySection,
            this.commandCardSection
        ]
    }
}