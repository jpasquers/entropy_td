import { BasicScene } from "../..";
import { ObjectRendererWithSync } from "../../../common/renderer";
import { FIXED_LAYER, GRID_LAYER } from "../../../common/z_layers";
import { BORDER_COLOR } from "../../../display_configs";
import { SubSceneDisplayContext } from "../../../phaser/extensions/display_context";
import { GRID_BORDER_THICKNESS, toExternalDim, toExternalOffset } from "../../../phaser/extensions/scene_grid";
import { SubScene } from "../../../phaser/extensions/sub_scene";



export class BorderedSubSceneRenderer extends ObjectRendererWithSync<SubScene,Phaser.GameObjects.Rectangle> {
    
    scene: BasicScene;
    

    constructor(scene: BasicScene) {
        super({
            alwaysCreate: false,
            withCleanup: true
        }, new SubSceneDisplayContext({
            scene: scene, 
            id: "glob_sub_scene",
            externalHeight: scene.getViewportHeight(),
            externalWidth: scene.getViewportWidth(),
            externalOffset: {
                pxCol: 0,
                pxRow: 0
            }, 
            layer: FIXED_LAYER}
        ));
        this.scene = scene;
    }

    create(subSection: SubScene): Phaser.GameObjects.Rectangle {
        let rect = this.scene.add.rectangle(
            subSection.externalOffset.pxCol + (subSection.externalWidth / 2),
            subSection.externalOffset.pxRow + (subSection.externalHeight / 2),
            subSection.externalWidth - GRID_BORDER_THICKNESS,
            subSection.externalHeight - GRID_BORDER_THICKNESS
        )
        if (subSection.filled) {
            rect.isFilled = true;
            rect.fillColor = subSection.filled;
        }
        rect.setStrokeStyle(GRID_BORDER_THICKNESS, BORDER_COLOR);
        rect.setDepth(subSection.layer);
        //if (subSection.fixed) rect.setScrollFactor(0);
        return rect;
        
    }

    update(item: SubScene, phaserObj: Phaser.GameObjects.Rectangle): void {
        //NO op for now.
    }
}
