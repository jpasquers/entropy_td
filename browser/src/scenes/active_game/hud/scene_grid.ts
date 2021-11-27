import { ActiveGameHudScene } from ".";
import { FIXED_LAYER } from "../../../common/z_layers";
import { BORDER_COLOR, BG_COLOR, COMMAND_CARD_WIDTH, COMMAND_CARD_HEIGHT } from "../../../display_configs";
import { BasicSceneGrid, GRID_BORDER_THICKNESS, toExternalDim } from "../../../phaser/extensions/scene_grid";
import { SubScene } from "../../../phaser/extensions/sub_scene";
import { getInternalGameplayHeight, getInternalGameplayWidth, NAVIGATION_INTERNAL_HEIGHT } from "../scene_grid";

export class ActiveGameHudGrid extends BasicSceneGrid<SubScene> {
    notificationSection: SubScene;
    navigationSection: SubScene;
    commandCardSection: SubScene;

    GAMEPLAY_INTERNAL_WIDTH: number;
    GAMEPLAY_INTERNAL_HEIGHT: number;
    NAVIGATION_INTERNAL_WIDTH: number;


    
    constructor(scene: ActiveGameHudScene) {
        super();
        this.GAMEPLAY_INTERNAL_HEIGHT = getInternalGameplayHeight(scene.gameController.config);
        this.GAMEPLAY_INTERNAL_WIDTH = getInternalGameplayWidth(scene.gameController.config);
        this.NAVIGATION_INTERNAL_WIDTH = this.GAMEPLAY_INTERNAL_WIDTH;
        this.navigationSection = {
            id: "activegame_navigation",
            scene: scene,
            externalOffset: {
                pxCol: 0,
                pxRow: 0
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
                pxCol: scene.getViewportWidth() - (COMMAND_CARD_WIDTH + 2*GRID_BORDER_THICKNESS),
                pxRow: scene.getViewportHeight() - (COMMAND_CARD_HEIGHT + 2*GRID_BORDER_THICKNESS)
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

