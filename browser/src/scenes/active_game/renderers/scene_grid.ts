import { ObjectRendererWithSync } from "../../../common/renderer";
import { FIXED_LAYER, GRID_LAYER } from "../../../common/z_layers";
import { BORDER_COLOR } from "../../../display_configs";
import { GlobalSceneDisplayContext } from "../../../phaser/extensions/display_context";
import { GRID_BORDER_THICKNESS, toExternalDim, toExternalOffset } from "../../../phaser/extensions/scene_grid";
import { BorderedSubScene, isBordered, SubScene } from "../../../phaser/extensions/sub_scene";



export class BorderedSubSceneRenderer extends ObjectRendererWithSync<BorderedSubScene,Phaser.GameObjects.Rectangle> {
    
    scene: Phaser.Scene;
    

    constructor(scene: Phaser.Scene) {
        super({
            alwaysCreate: false,
            withCleanup: true
        }, new GlobalSceneDisplayContext(scene));
        this.scene = scene;
    }

    create(subSection: BorderedSubScene): Phaser.GameObjects.Rectangle {
        let rect = this.scene.add.rectangle(
            toExternalOffset(subSection.internalOffset).pxCol + (toExternalDim(subSection.internalWidth) / 2),
            toExternalOffset(subSection.internalOffset).pxRow + (toExternalDim(subSection.internalHeight) / 2),
            subSection.internalWidth + GRID_BORDER_THICKNESS,
            subSection.internalHeight + GRID_BORDER_THICKNESS
        )
        if (subSection.filled) {
            rect.isFilled = true;
            rect.fillColor = subSection.filled;
        }
        rect.setStrokeStyle(GRID_BORDER_THICKNESS, BORDER_COLOR);
        if (subSection.fixed) {
            rect.setDepth(FIXED_LAYER);
        }
        else {
            rect.setDepth(GRID_LAYER);
        }
        if (subSection.fixed) rect.setScrollFactor(0);
        return rect;
        
    }

    update(item: BorderedSubScene, phaserObj: Phaser.GameObjects.Rectangle): void {
        //NO op for now.
    }
}
