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
    controls?: Phaser.Cameras.Controls.SmoothedKeyControl;

    constructor() {
        super({
            active: false,
            visible: false
        });
        this.frameCount = 0;

        this.frameDeltaPublisher = new FrameDeltaPublisher();

        
    }

    mapCameraPosToGamePos(cameraPos: PixelCoordinate): PixelCoordinate {
        return {
            pxCol: cameraPos.pxCol + this.cameras.main.scrollX,
            pxRow: cameraPos.pxRow + this.cameras.main.scrollY
        }
    }

    create() {
        this.mouseMovementTracker = new MouseMovementPublisher(this.input);
        this.frameDeltaPublisher.addObserver(this.mouseMovementTracker);
        this.keyTracker = new KeyDownPublisher(this.input);
        this.clickTracker = new ClickPublisher(this.input);

        //  From here down is just camera controls and feedback
        var cursors = this.input.keyboard.createCursorKeys();

        var controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            acceleration: 0.06,
            drag: 0.0005,
            maxSpeed: 1.0
        };

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    }

    update(time: number, delta: number) {
        this.frameDeltaPublisher.publishEvent({delta});
        this.controls!.update(delta);
    }

    getViewportWidth():number {
        return this.cameras.main.width;
    }

    getViewportHeight(): number {
        return this.cameras.main.height;
    }

    abstract handleActionError(e: ActionError): void;
}