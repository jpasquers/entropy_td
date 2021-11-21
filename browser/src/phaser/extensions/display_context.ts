import { PixelCoordinate } from "entropy-td-core";
import { CameraFixedSubScene, isCameraFixed, isWorldFixed, SubScene, WorldFixedSubScene } from "./sub_scene";


//THIS IS BASICALLY WHERE I NEED TO DO ALL MY NEW WORK.

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
    addTiledSprite(x: number,y: number, totalWidth: number, totalHeight: number, spriteKey: string): Phaser.GameObjects.TileSprite;
    getInternalBoundWidth(): number;
    getInternalBoundHeight(): number;
    //addTween(config: TweenBuilderConfig): Phaser.Tweens.Tween;
}

const hasScrollFactor =  (t: any):t is Phaser.GameObjects.Components.ScrollFactor => {
    return "setScrollFactor" in t;
}

export const forSubScene = (subScene: SubScene): DisplayContext => {
    return new SubSceneDisplayContext(subScene);
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
        return t;
    }


    addTiledSprite(x: number, y: number, totalWidth: number, totalHeight: number, spriteKey: string): Phaser.GameObjects.TileSprite {
        return this.postProcess(this.subScene.scene.add.tileSprite(
            this.addColOffset(x),
            this.addRowOffset(y),
            totalWidth,totalHeight,
            spriteKey
        ));
    }

    setXPos(obj: CanSetPos, x: number): void {
        obj.setX(this.addColOffset(x));
    }
    setYPos(obj: CanSetPos, y: number): void {
        obj.setY(this.addRowOffset(y));
    }

    addSprite(relTopLeft: PixelCoordinate, dimX: number, dimY: number, spriteKey: string): Phaser.GameObjects.Sprite {
        let sprite = this.subScene.scene.add.sprite(
            this.addColOffset(relTopLeft.pxCol) + dimX/2,
            this.addRowOffset(relTopLeft.pxRow) + dimY/2,
            spriteKey
        )
        sprite.setDisplaySize(dimX, dimY);
        return this.postProcess(sprite);
    }

    addLine(px1: PixelCoordinate, px2: PixelCoordinate, color: number, alpha: number): Phaser.GameObjects.Line {
        return this.postProcess(this.subScene.scene.add.line(
            undefined,undefined,
            this.addColOffset(px1.pxCol),
            this.addRowOffset(px1.pxRow),
            this.addColOffset(px2.pxCol),
            this.addRowOffset(px2.pxRow),
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

    addColOffset(col: number) {
        return col + this.subScene.externalOffset.pxCol;
    }

    addRowOffset(row: number) {
        return row + this.subScene.externalOffset.pxRow;
    }

    addCircle(center: PixelCoordinate, radius: number, color: number): Phaser.GameObjects.Arc {
        let circle =  this.subScene.scene.add.circle(
            this.addColOffset(center.pxCol),
            this.addRowOffset(center.pxRow),
            radius,
            color
        );
        return this.postProcess(circle);
        
    }
    addRectangle(relTopLeft: PixelCoordinate, width: number, height: number,fillColor?: number): Phaser.GameObjects.Rectangle {
        return this.postProcess(this.subScene.scene.add.rectangle(
            this.addColOffset(relTopLeft.pxCol) + width/2,
            this.addRowOffset(relTopLeft.pxRow) + height / 2,
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
            this.addColOffset(relTopLeft.pxCol),
            this.addRowOffset(relTopLeft.pxRow),
            text
        ));
    }

    addImage(relTopLeft: PixelCoordinate, dimX: number, dimY: number, imageKey: string): Phaser.GameObjects.Image {
        let image =  this.subScene.scene.add.image(
            this.addColOffset(relTopLeft.pxCol) + dimX/2,
            this.addRowOffset(relTopLeft.pxRow) + dimY/2,
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