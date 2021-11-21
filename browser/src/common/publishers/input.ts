import { PixelCoordinate } from "entropy-td-core";
import { CameraAdapter } from "../../phaser/extensions/camera";
import { Observer, Publisher } from "./";
import { FrameDeltaEvent, FrameDeltaObserver } from "./frame_delta";

export interface MouseMovement {
    newCameraPos: PixelCoordinate;
    newWorldPos: PixelCoordinate;
    delta: PixelCoordinate;
    lDrag: boolean;
    rDrag: boolean;
}

export interface ClickEvent {
    targetCameraPos: PixelCoordinate;
    targetWorldPos: PixelCoordinate;
}

export interface KeyDownEvent {
    key: string;
}

export interface ScrollEvent {
    zoomIn: boolean;
    amount: number;
}

export type MouseMovementObserver = Observer<MouseMovement>;

export type ClickObserver = Observer<ClickEvent>;

export type MouseScollObserver = Observer<ScrollEvent>;

export type KeyDownObserver = Observer<KeyDownEvent>;

class InputPublisher<EventType> extends Publisher<EventType> {
    input: Phaser.Input.InputPlugin;

    constructor(input: Phaser.Input.InputPlugin, observers?: Observer<EventType>[]) {
        super(observers);
        this.input = input;
    }
}

export class MouseScrollPublisher extends InputPublisher<ScrollEvent> {
    constructor(input: Phaser.Input.InputPlugin, observers?: MouseScollObserver[]) {
        super(input, observers);
        this.input.on("scroll", (pointer: unknown, gameObjects: unknown, deltaX: number, deltaY: number, deltaZ: number) => {
            console.log("scroll happened!");
            this.publishEvent({
                zoomIn: deltaY < 0,
                amount: Math.abs(deltaY)
            })
        })
    }
}

export class MouseMovementPublisher extends InputPublisher<MouseMovement> implements FrameDeltaObserver {
    previousMousePosition?: PixelCoordinate;
    previousRDown: boolean;
    previousLDown: boolean;
    id: string;
    cameraAdapter: CameraAdapter;

    constructor(input: Phaser.Input.InputPlugin, cameraAdapter: CameraAdapter, mouseMovementListeners?: MouseMovementObserver[]) {
        super(input, mouseMovementListeners);
        this.cameraAdapter = cameraAdapter;
        this.id = "mouse_movement_publisher";
        this.previousMousePosition = this.getMousePosition();
        this.previousLDown = false;
        this.previousRDown = false;
    }
    
    onEvent(event: FrameDeltaEvent): void {
        if (this.hasMouseChanged()) {
            this.publishEvent({
                newCameraPos: this.getMousePosition(),
                newWorldPos: this.cameraAdapter.toWorldPos(this.getMousePosition()),
                delta: {
                    pxCol: this.getMousePosition().pxCol - this.previousMousePosition!.pxCol,
                    pxRow: this.getMousePosition().pxRow - this.previousMousePosition!.pxRow
                },
                lDrag: this.input.mousePointer.leftButtonDown() && this.previousLDown,
                rDrag: this.input.mousePointer.rightButtonDown() && this.previousRDown
            })
            this.previousRDown = this.input.mousePointer.rightButtonDown();
            this.previousLDown = this.input.mousePointer.leftButtonDown();
            this.previousMousePosition = this.getMousePosition();
        }
    }


    hasMouseChanged() {
        let previous = this.previousMousePosition;
        let current = this.getMousePosition();
        return !previous || !current ||
            previous.pxCol !== current.pxCol ||
            previous.pxRow !== current.pxRow;
    }

    getMousePosition(): PixelCoordinate {
        let pointer = this.input.mousePointer;
        return {
            pxCol: pointer.x,
            pxRow: pointer.y
        }
    }
}

export class KeyDownPublisher extends InputPublisher<KeyDownEvent> {
    constructor(input: Phaser.Input.InputPlugin, observers?: KeyDownObserver[]) {
        super(input, observers);
        this.input.keyboard.on("keydown", this.keyHandler.bind(this));
    }

    keyHandler(event: KeyboardEvent): void {
        if (event.code.includes("Key")) {
            this.publishEvent({
                key: event.code.replace("Key","")
            })
        }
    }
}

export class ClickPublisher extends InputPublisher<ClickEvent> {
    cameraAdapter: CameraAdapter;

    constructor(input: Phaser.Input.InputPlugin, cameraAdapter: CameraAdapter, observers?: ClickObserver[]) {
        super(input, observers);
        this.cameraAdapter = cameraAdapter;
        this.input.on("gameobjectdown", this.clickHandler.bind(this));
    }

    clickHandler(input: Phaser.Input.Pointer): void {
        let pixel: PixelCoordinate = this.pixelFromPointer(input);
        this.publishEvent({
            targetCameraPos: pixel,
            targetWorldPos: this.cameraAdapter.toWorldPos(pixel)
        });
    }

    pixelFromPointer(input: Phaser.Input.Pointer): PixelCoordinate {
        return {
            pxCol: input.downX,
            pxRow: input.downY
        }
    }
}