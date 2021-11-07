import { PixelCoordinate } from "entropy-td-core";
import { Observer, Publisher } from "./";
import { FrameDeltaEvent, FrameDeltaObserver } from "./frame_delta";

export interface MouseMovement {
    newCameraPos: PixelCoordinate;
    delta: PixelCoordinate;
    lDown: boolean;
    rDown: boolean;
}

export interface ClickEvent {
    targetCameraPos: PixelCoordinate;
}

export interface KeyDownEvent {
    key: string;
}

export type MouseMovementObserver = Observer<MouseMovement>;

export type ClickObserver = Observer<ClickEvent>;

export type KeyDownObserver = Observer<KeyDownEvent>;

class InputPublisher<EventType> extends Publisher<EventType> {
    input: Phaser.Input.InputPlugin;

    constructor(input: Phaser.Input.InputPlugin, observers?: Observer<EventType>[]) {
        super(observers);
        this.input = input;
    }
}

export class MouseMovementPublisher extends InputPublisher<MouseMovement> implements FrameDeltaObserver {
    previousMousePosition?: PixelCoordinate;
    id: string;

    constructor(input: Phaser.Input.InputPlugin, mouseMovementListeners?: MouseMovementObserver[]) {
        super(input, mouseMovementListeners);
        this.id = "mouse_movement_publisher";
        this.previousMousePosition = this.getMousePosition();
    }
    
    onEvent(event: FrameDeltaEvent): void {
        if (this.hasMouseChanged()) {
            this.publishEvent({
                newCameraPos: this.getMousePosition(),
                delta: {
                    pxCol: this.getMousePosition().pxCol - this.previousMousePosition!.pxCol,
                    pxRow: this.getMousePosition().pxRow - this.previousMousePosition!.pxRow
                },
                lDown: this.input.mousePointer.leftButtonDown(),
                rDown: this.input.mousePointer.rightButtonDown()
            })
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

    constructor(input: Phaser.Input.InputPlugin, observers?: ClickObserver[]) {
        super(input, observers);
        this.input.on("gameobjectdown", this.clickHandler.bind(this));
    }

    clickHandler(input: Phaser.Input.Pointer): void {
        let pixel: PixelCoordinate = this.pixelFromPointer(input);
        this.publishEvent({
            targetCameraPos: pixel
        });
    }

    pixelFromPointer(input: Phaser.Input.Pointer): PixelCoordinate {
        return {
            pxCol: input.downX,
            pxRow: input.downY
        }
    }
}