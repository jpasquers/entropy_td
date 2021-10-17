import { PixelCoordinate } from "entropy-td-core/lib/game_board";
import { MouseMovementListener } from "../mouse_tracker";

export class MouseMovementTracker {
    mouseMovementListeners: MouseMovementListener[];
    previousMousePosition?: PixelCoordinate;
    input: Phaser.Input.InputPlugin;

    constructor(input: Phaser.Input.InputPlugin, mouseMovementListeners?: MouseMovementListener[]) {
        this.mouseMovementListeners = mouseMovementListeners ?? [];
        this.input = input;
    }

    public trackContiguousInput(frameDelta: number) {
        if (this.hasMouseChanged()) {
            this.mouseMovementListeners.forEach(listener => {
                listener.onMove(this.getMousePosition());
            })
        }
    }

    public removeListener(removeIf: (listener: MouseMovementListener)=>boolean) {
        this.mouseMovementListeners = this.mouseMovementListeners.filter(listener => !removeIf(listener));
    }

    public addMouseMovementListener(mouseMovementListener: MouseMovementListener) {
        this.mouseMovementListeners.push(mouseMovementListener);
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