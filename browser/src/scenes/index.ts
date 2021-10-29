import { ActionError } from "entropy-td-core/lib/actions/action_handler";
import { FrameDeltaPublisher } from "../common/publishers/frame_delta";
import { ClickPublisher, KeyDownPublisher, MouseMovementPublisher } from "../common/publishers/input";
import { SceneGrid } from "../phaser/extensions/scene_grid";

export abstract class BasicScene extends Phaser.Scene {

    frameCount: number;
    mouseMovementTracker?: MouseMovementPublisher;
    keyTracker?: KeyDownPublisher;
    clickTracker?: ClickPublisher;
    frameDeltaPublisher: FrameDeltaPublisher;

    constructor() {
        super({
            active: false,
            visible: false
        });
        this.frameCount = 0;

        this.frameDeltaPublisher = new FrameDeltaPublisher();
    }

    create() {
        this.mouseMovementTracker = new MouseMovementPublisher(this.input);
        this.frameDeltaPublisher.addObserver(this.mouseMovementTracker);
        this.keyTracker = new KeyDownPublisher(this.input);
        this.clickTracker = new ClickPublisher(this.input);
    }

    update(time: number, delta: number) {
        this.frameDeltaPublisher.publishEvent({delta});
    }

    abstract handleActionError(e: ActionError): void;
}