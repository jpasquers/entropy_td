import { PixelCoordinate } from "entropy-td-core";
import { CameraFixedSubScene, isCameraFixed, isWorldFixed, SubScene, WorldFixedSubScene } from "./sub_scene";

export interface CanSetPos {
    setX(x: number): void;
    setY(y: number): void;
}

export interface DisplayContext {
    //The main problem with doing relTopLeft, is that then setX and setY still reference the center.
    addRectangle(relTopLeft: PixelCoordinate, width: number, height: number, fillColor?: number): Phaser.GameObjects.Rectangle;
    addCenteredText(topMargin: number, text: string): Phaser.GameObjects.Text;
    addTextStartingAt(relTopLeft: PixelCoordinate, text: string): Phaser.GameObjects.Text;
    addImage(relTopLeft: PixelCoordinate, dimX: number, dimY: number, imageKey: string): Phaser.GameObjects.Image;
    addCircle(center: PixelCoordinate, radius: number, color: number): Phaser.GameObjects.Arc;
    getCenter(): PixelCoordinate;
    addLine(px1: PixelCoordinate, px2: PixelCoordinate, color: number, alpha: number): Phaser.GameObjects.Line;
    scopeGlobalToContext(absolute: PixelCoordinate): PixelCoordinate;
    scopeToGlobal(relative: PixelCoordinate): PixelCoordinate;
    addSprite(relTopLeft: PixelCoordinate, dimX: number, dimY: number, spriteKey: string): Phaser.GameObjects.Sprite;
    setXPos(obj: CanSetPos,x: number): void;
    setYPos(obj: CanSetPos, y: number): void;
    getInternalBoundWidth(): number;
    getInternalBoundHeight(): number;
    //addTween(config: TweenBuilderConfig): Phaser.Tweens.Tween;
}

export const forSubScene = (subScene: SubScene): DisplayContext => {
    return new SubSceneDisplayContext(subScene);
}

export interface ManipulatableDepth {
    depth: number;
}

export const hasDepth = (t: any): t is ManipulatableDepth => {
    return "depth" in t;
}

/**
 * By default, Phaser cannot split up a scene into sections.
 * A given game section renderer should not have to understand its own offset.
 */
export class SubSceneDisplayContext implements DisplayContext {
    subScene: SubScene;

    constructor(subScene: SubScene) {
        this.subScene = subScene;
    }

    postProcess<T extends Phaser.GameObjects.GameObject>(t: T): T {
        if (hasDepth(t)) {
            t.depth = this.subScene.layer;
        }
        return t;
    }




    setXPos(obj: CanSetPos, x: number): void {
        obj.setX(this.addInternalColOffset(x));
    }
    setYPos(obj: CanSetPos, y: number): void {
        obj.setY(this.addInternalRowOffset(y));
    }

    addSprite(relTopLeft: PixelCoordinate, dimX: number, dimY: number, spriteKey: string): Phaser.GameObjects.Sprite {
        let sprite = this.subScene.scene.add.sprite(
            this.addInternalColOffset(relTopLeft.pxCol) + dimX/2,
            this.addInternalRowOffset(relTopLeft.pxRow) + dimY/2,
            spriteKey
        )
        sprite.setDisplaySize(dimX, dimY);
        return this.postProcess(sprite);
    }

    addLine(px1: PixelCoordinate, px2: PixelCoordinate, color: number, alpha: number): Phaser.GameObjects.Line {
        return this.postProcess(this.subScene.scene.add.line(
            undefined,undefined,
            this.addInternalColOffset(px1.pxCol),
            this.addInternalRowOffset(px1.pxRow),
            this.addInternalColOffset(px2.pxCol),
            this.addInternalRowOffset(px2.pxRow),
            color,
            alpha
        ));
    }

    scopeGlobalToContext(absolute: PixelCoordinate): PixelCoordinate {
        return {
            pxRow: absolute.pxRow - this.subScene.externalOffset.pxRow,
            pxCol: absolute.pxCol - this.subScene.externalOffset.pxCol
        }
    }

    scopeToGlobal(relative: PixelCoordinate): PixelCoordinate {
        return {
            pxRow: relative.pxRow + this.subScene.externalOffset.pxRow,
            pxCol: relative.pxCol + this.subScene.externalOffset.pxCol
        }
    }

    addInternalColOffset(col: number) {
        return col + this.subScene.externalOffset.pxCol + (this.subScene.border?.width ?? 0);
    }

    addInternalRowOffset(row: number) {
        return row + this.subScene.externalOffset.pxRow + (this.subScene.border?.width ?? 0);
    }

    addCircle(center: PixelCoordinate, radius: number, color: number): Phaser.GameObjects.Arc {
        let circle =  this.subScene.scene.add.circle(
            this.addInternalColOffset(center.pxCol),
            this.addInternalRowOffset(center.pxRow),
            radius,
            color
        );
        return this.postProcess(circle);
        
    }
    addRectangle(relTopLeft: PixelCoordinate, width: number, height: number,fillColor?: number): Phaser.GameObjects.Rectangle {
        return this.postProcess(this.subScene.scene.add.rectangle(
            this.addInternalColOffset(relTopLeft.pxCol) + width/2,
            this.addInternalRowOffset(relTopLeft.pxRow) + height / 2,
            width,
            height,
            fillColor
        ));
    }
    addCenteredText(topMargin: number, text: string): Phaser.GameObjects.Text {
        return this.postProcess(this.subScene.scene.add.text(
            this.getCenter().pxCol,
            topMargin,
            text
        ).setOrigin(0.5));
    }

    addTextStartingAt(relTopLeft: PixelCoordinate, text: string): Phaser.GameObjects.Text {
        return this.postProcess(this.subScene.scene.add.text(
            this.addInternalColOffset(relTopLeft.pxCol),
            this.addInternalRowOffset(relTopLeft.pxRow),
            text
        ));
    }

    addImage(relTopLeft: PixelCoordinate, dimX: number, dimY: number, imageKey: string): Phaser.GameObjects.Image {
        let image =  this.subScene.scene.add.image(
            this.addInternalColOffset(relTopLeft.pxCol) + dimX/2,
            this.addInternalRowOffset(relTopLeft.pxRow) + dimY/2,
            imageKey
        );
        image.displayHeight = dimY;
        image.displayWidth = dimX;
        return this.postProcess(image);
        
    }
    getCenter(): PixelCoordinate {
        return {
            pxCol: this.subScene.externalOffset.pxCol + this.getInternalBoundWidth()/2,
            pxRow: this.subScene.externalOffset.pxRow + this.getInternalBoundHeight()/2
        }
    }

    getInternalBoundWidth(): number {
        if (!this.subScene.border) return this.subScene.externalWidth;
        else return this.subScene.externalWidth - (this.subScene.border.width*2);
    }
    getInternalBoundHeight(): number {
        if (!this.subScene.border) return this.subScene.externalHeight;
        else return this.subScene.externalHeight - (this.subScene.border.width*2);
    }
}