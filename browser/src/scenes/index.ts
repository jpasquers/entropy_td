import { ActionError, PixelCoordinate } from "entropy-td-core";
import { FrameDeltaPublisher } from "../common/publishers/frame_delta";
import { ClickPublisher, KeyDownPublisher, MouseMovementPublisher } from "../common/publishers/input";
import { SceneGrid } from "../phaser/extensions/scene_grid";

export abstract class BasicScene extends Phaser.Scene {

    frameCount: number;
    mouseMovementTracker?: MouseMovementPublisher;
    keyTracker?: KeyDownPublisher;
    clickTracker?: ClickPublisher;
    frameDeltaPublisher: FrameDeltaPublisher;
    prevTime?: number;

    constructor() {
        super({
            active: false,
            visible: false
        });
        this.frameCount = 0;

        this.frameDeltaPublisher = new FrameDeltaPublisher();

        
    }

    mapCameraPosToGamePos(cameraPos: PixelCoordinate): PixelCoordinate {
        let worldPos = this.cameras.main.getWorldPoint(cameraPos.pxCol, cameraPos.pxRow)
        return {
            pxCol: worldPos.x,
            pxRow: worldPos.y
        }
    }

    create() {
        this.mouseMovementTracker = new MouseMovementPublisher(this.input);
        this.frameDeltaPublisher.addObserver(this.mouseMovementTracker);
        this.keyTracker = new KeyDownPublisher(this.input);
        this.clickTracker = new ClickPublisher(this.input);
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