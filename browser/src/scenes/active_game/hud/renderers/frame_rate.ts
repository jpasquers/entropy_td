import { FrameDeltaObserver, FrameDeltaEvent } from "../../../../common/publishers/frame_delta";
import { SimpleRenderer } from "../../../../common/renderer";
import { SIT_ON_FIXED_LAYER } from "../../../../common/z_layers";
import { forSubScene } from "../../../../phaser/extensions/display_context";
import { SubScene } from "../../../../phaser/extensions/sub_scene";


export class FrameRateRenderer extends SimpleRenderer<Phaser.GameObjects.Text> implements FrameDeltaObserver {
    id: string;
    timer?: Phaser.GameObjects.Text;

    constructor(subScene: SubScene) {
        super(forSubScene(subScene));
        this.id = "time_renderer";
    }

    onEvent(event: FrameDeltaEvent): void {
        if (!this.timer) {
            this.timer = this.displayContext.addTextStartingAt({pxCol: 100,pxRow: 20}, `${Math.floor(event.rawAvgFrameRate)}`);
            this.timer.setFontSize(35);
            this.timer.setDepth(SIT_ON_FIXED_LAYER);
            this.timer.setColor("green");
        }
        else {
            this.timer.setText(`${Math.floor(event.rawAvgFrameRate)}`);
        }
    }
    
}