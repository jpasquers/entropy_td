import { ActionError } from "entropy-td-core/lib/actions/action_handler";
import { BorderedSceneSubSection, SubSectionRenderer } from ".";


const ERROR_COLOR = "#e35d5d";

/**
 * Follows a different paradigm since it is not a frame update rendered object.
 */
export class ErrorRenderer {
    currentRenderedError?: Phaser.GameObjects.Text;
    currentTween?: Phaser.Tweens.Tween;
    sceneSection: BorderedSceneSubSection;
    constructor(sceneSection: BorderedSceneSubSection) {
        this.sceneSection = sceneSection;
    }

    renderError(error: ActionError) {
        if (this.currentRenderedError) {
            this.currentRenderedError.destroy();
        }
        if (this.currentTween) {
            this.currentTween.destroy();
        }
        this.currentRenderedError = this.sceneSection.scene.add.text(
            this.sceneSection.internalOffset.pxCol + (this.sceneSection.internalWidth / 2),
            this.sceneSection.internalOffset.pxRow + 200,
            error.message,
            {
                color: ERROR_COLOR,
                fontSize: "24px"
            }
        ).setOrigin(0.5);
        this.sceneSection.scene.add.tween({
            targets: this.currentRenderedError,
            alpha: 0,
            duration: 2000,
            ease: 'Power2'
          })
    }
}