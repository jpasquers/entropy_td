import { ActionError } from "entropy-td-core";
import { GameState } from "entropy-td-core";
import { DisplayContext, SubSceneDisplayContext } from "../../../phaser/extensions/display_context";
import { BorderedSubScene } from "../../../phaser/extensions/sub_scene";
import { GameStateObserver } from "../gamestate_publisher";


const ERROR_COLOR = "#e35d5d";

/**
 * Follows a different paradigm since it is not a frame update rendered object.
 */
export class ErrorRenderer {
    currentRenderedError?: Phaser.GameObjects.Text;
    currentTween?: Phaser.Tweens.Tween;
    displayContext: DisplayContext;
    subScene: BorderedSubScene;
    constructor(subScene: BorderedSubScene) {
        this.subScene = subScene
        this.displayContext = new SubSceneDisplayContext(subScene);
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
                pxCol: this.subScene.internalWidth / 2,
                pxRow: 200
            },
            error.message
        ).setOrigin(0.5);
        this.subScene.scene.add.tween({
            targets: this.currentRenderedError,
            alpha: 0,
            duration: 2000,
            ease: 'Power2'
          })
    }
}