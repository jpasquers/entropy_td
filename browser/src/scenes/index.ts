import { ActionError, PixelCoordinate } from "entropy-td-core";
import { FrameDeltaPublisher } from "../common/publishers/frame_delta";
import { ClickPublisher, KeyDownPublisher, MouseMovementPublisher, MouseScrollPublisher } from "../common/publishers/input";
import { CameraAdapter } from "../phaser/extensions/camera";
import { SceneGrid } from "../phaser/extensions/scene_grid";
import { ObjectAnimator } from "../phaser/extensions/tween";

export abstract class BasicScene extends Phaser.Scene {

    frameCount: number;
    mouseMovementTracker?: MouseMovementPublisher;
    mouseScrollTracker?: MouseScrollPublisher;
    keyTracker?: KeyDownPublisher;
    clickTracker?: ClickPublisher;
    frameDeltaPublisher: FrameDeltaPublisher;
    mainCameraAdapter?: CameraAdapter;
    tweenDelegate?: ObjectAnimator;
    prevTime?: number;

    constructor(key: string) {
        super({
            active: true,
            visible: true,
            key: key
        });
        this.frameCount = 0;
        this.frameDeltaPublisher = new FrameDeltaPublisher();
    }

    create() {
        this.mainCameraAdapter = new CameraAdapter(this.cameras.main);
        this.mouseMovementTracker = new MouseMovementPublisher(this.input, this.mainCameraAdapter);
        this.frameDeltaPublisher.addObserver(this.mouseMovementTracker);
        this.keyTracker = new KeyDownPublisher(this.input);
        this.clickTracker = new ClickPublisher(this.input, this.mainCameraAdapter);
        this.mouseScrollTracker = new MouseScrollPublisher(this.input);
        this.tweenDelegate = new ObjectAnimator(this);
    }

    update(time: number, delta: number) {
        this.prevTime = time;
        this.frameCount++;
        let frameRate = (1000 / (time / this.frameCount));
        this.frameDeltaPublisher.publishEvent({delta, rawAvgFrameRate: frameRate});

    }

    getViewportWidth():number {
        return this.cameras.main.width;
    }

    getViewportHeight(): number {
        return this.cameras.main.height;
    }

    abstract handleActionError(e: ActionError): void;
}