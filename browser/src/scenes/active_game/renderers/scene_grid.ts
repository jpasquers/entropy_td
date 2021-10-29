import { ObjectRendererWithSync } from "../../../common/renderer";
import { GRID_LAYER } from "../../../common/z_layers";
import { GlobalSceneDisplayContext } from "../../../phaser/extensions/display_context";
import { GRID_BORDER_THICKNESS, toExternalDim, toExternalOffset } from "../../../phaser/extensions/scene_grid";
import { BorderedSubScene } from "../../../phaser/extensions/sub_scene";



export class SceneGridRenderer extends ObjectRendererWithSync<BorderedSubScene,Phaser.GameObjects.Rectangle> {
    
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
        rect.isFilled = false;
        rect.setStrokeStyle(GRID_BORDER_THICKNESS, 0xa69b9a);
        rect.setDepth(GRID_LAYER);
        return rect;
    }

    update(item: BorderedSubScene, phaserObj: Phaser.GameObjects.Rectangle): void {
        //NO op for now.
    }
}
