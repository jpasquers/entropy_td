import { ActionError } from "entropy-td-core";
import { GameState } from "entropy-td-core";
import { NOTIFICATION_LAYER } from "../../../../common/z_layers";
import { DisplayContext, forSubScene } from "../../../../phaser/extensions/display_context";
import { SubScene } from "../../../../phaser/extensions/sub_scene";


const ERROR_COLOR = "#e35d5d";

/**
 * Follows a different paradigm since it is not a frame update rendered object.
 */
export class ErrorRenderer {
    currentRenderedError?: Phaser.GameObjects.Text;
    currentTween?: Phaser.Tweens.Tween;
    displayContext: DisplayContext;
    subScene: SubScene;
    constructor(subScene: SubScene) {
        this.subScene = subScene
        this.displayContext = forSubScene(subScene);
    }

    renderError(error: ActionError) {
        if (this.currentRenderedError) {
            this.currentRenderedError.destroy();
        }
        if (this.currentTween) {
            this.currentTween.destroy();
        }
        this.currentRenderedError = this.displayContext.addTextStartingAt(
            {
                pxCol: this.displayContext.getInternalBoundWidth() / 2,
                pxRow: 200
            },
            error.message
        ).setOrigin(0.5);
        this.currentRenderedError.setDepth(NOTIFICATION_LAYER);
        this.subScene.scene.add.tween({
            targets: this.currentRenderedError,
            alpha: 0,
            duration: 2000,
            ease: 'Power2'
          })
    }
}