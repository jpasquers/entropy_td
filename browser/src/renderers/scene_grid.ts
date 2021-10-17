import { PixelCoordinate } from "entropy-td-core/lib/game_board";
import { CustomRenderer, BorderedSceneSubSection } from ".";
import { SceneGrid } from "../scene_grid";
import { GRID_LAYER } from "../z_layers";

export const GRID_BORDER_THICKNESS = 8;

export const toExternalDim = (internal: number): number => {
    return internal + 2*GRID_BORDER_THICKNESS;
}

export const toExternalOffset = (internal: PixelCoordinate): PixelCoordinate => {
    return {
        pxCol: internal.pxCol - GRID_BORDER_THICKNESS,
        pxRow: internal.pxRow - GRID_BORDER_THICKNESS
    }
}

export class SceneGridRenderer extends CustomRenderer<BorderedSceneSubSection,Phaser.GameObjects.Rectangle> {
    
    scene: Phaser.Scene;
    

    constructor(scene: Phaser.Scene) {
        super({
            alwaysCreate: false,
            withCleanup: true
        })
        this.scene = scene;
    }

    create(subSection: BorderedSceneSubSection): Phaser.GameObjects.Rectangle {
        let rect = this.scene.add.rectangle(
            toExternalOffset(subSection.internalOffset).pxCol + (toExternalDim(subSection.internalWidth) / 2),
            toExternalOffset(subSection.internalOffset).pxRow + (toExternalDim(subSection.internalHeight) / 2),
            subSection.internalWidth + GRID_BORDER_THICKNESS,
            subSection.internalHeight + GRID_BORDER_THICKNESS
        )
        rect.isFilled = false;
        rect.setStrokeStyle(GRID_BORDER_THICKNESS, 0xa69b9a);
        rect.setDepth(GRID_LAYER);
        return rect;
    }

    update(item: BorderedSceneSubSection, phaserObj: Phaser.GameObjects.Rectangle): void {
        //NO op for now.
    }
}
