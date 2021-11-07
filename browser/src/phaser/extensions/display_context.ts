import { PixelCoordinate } from "entropy-td-core";
import { BorderedSubScene, SubScene } from "./sub_scene";


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

export class CommonSceneDelegate {

}

export class GlobalSceneDisplayContext implements DisplayContext {
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    
    addTiledSprite(x: number, y: number, totalWidth: number, totalHeight: number, spriteKey: string): Phaser.GameObjects.TileSprite {
        return this.scene.add.tileSprite(
            x,y,totalWidth,totalHeight, spriteKey
        );
    }

    addLine(px1: PixelCoordinate, px2: PixelCoordinate, color: number, alpha: number): Phaser.GameObjects.Line {
        return this.scene.add.line(
            undefined,undefined,px1.pxCol,px1.pxRow,
            px2.pxCol,px2.pxRow,color, alpha
        );
    }
    setXPos(obj: CanSetPos, x: number): void {
        obj.setX(x);
    }
    setYPos(obj: CanSetPos, y: number): void {
        obj.setY(y);
    }

    addSprite(relTopLeft: PixelCoordinate,dimX: number, dimY: number, spriteKey: string): Phaser.GameObjects.Sprite {
        let sprite =  this.scene.add.sprite(
            relTopLeft.pxCol+dimX/2,relTopLeft.pxRow+dimY/2,spriteKey
        )
        sprite.setDisplaySize(dimX,dimY);
        return sprite;
    }


    scopeGlobalToContext(global: PixelCoordinate): PixelCoordinate {
        return global;
    }

    scopeToGlobal(relative: PixelCoordinate): PixelCoordinate {
        return relative;
    }
    
    addCircle(center: PixelCoordinate, radius: number, color: number): Phaser.GameObjects.Arc {
        return this.scene.add.circle(
            center.pxCol,
            center.pxRow,
            radius,
            color
        )
    }
    addRectangle(relTopLeft: PixelCoordinate, width: number, height: number,fillColor?: number): Phaser.GameObjects.Rectangle {
        return this.scene.add.rectangle(
            relTopLeft.pxCol + width/2,
            relTopLeft.pxRow + height/2,
            width,
            height,
            fillColor
        );
    }
    addCenteredText(topMargin: number, text: string): Phaser.GameObjects.Text {
        return this.scene.add.text(
            this.getCenter().pxCol,
            topMargin,
            text
        ).setOrigin(0.5);
    }

    addTextStartingAt(relTopLeft: PixelCoordinate, text: string): Phaser.GameObjects.Text {
        return this.scene.add.text(
            relTopLeft.pxCol,
            relTopLeft.pxRow,
            text
        )
    }

    addImage(relTopLeft: PixelCoordinate, dimX: number, dimY: number, imageKey: string): Phaser.GameObjects.Image {
        let image = this.scene.add.image(
            relTopLeft.pxCol + dimX/2,
            relTopLeft.pxRow + dimY/2,
            imageKey
        );
        image.displayHeight = dimY;
        image.displayWidth = dimX;
        return image;
    }

    getCenter(): PixelCoordinate {
        throw new Error("Center unavailable in base scene class");
    }

    getInternalBoundWidth(): number {
        throw new Error("Method not implemented.");
    }
    getInternalBoundHeight(): number {
        throw new Error("Method not implemented.");
    }
}

const hasScrollFactor =  (t: any):t is Phaser.GameObjects.Components.ScrollFactor => {
    return "setScrollFactor" in t;
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
        if (hasScrollFactor(t) && this.subScene.fixed) {
            t.setScrollFactor(0);
        }
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
            pxRow: absolute.pxRow - this.subScene.internalOffset.pxRow,
            pxCol: absolute.pxCol - this.subScene.internalOffset.pxCol
        }
    }

    scopeToGlobal(relative: PixelCoordinate): PixelCoordinate {
        return {
            pxRow: relative.pxRow + this.subScene.internalOffset.pxRow,
            pxCol: relative.pxCol + this.subScene.internalOffset.pxCol
        }
    }

    addColOffset(col: number) {
        return col + this.subScene.internalOffset.pxCol;
    }

    addRowOffset(row: number) {
        return row + this.subScene.internalOffset.pxRow;
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
            pxCol: this.subScene.internalOffset.pxCol + this.subScene.internalWidth/2,
            pxRow: this.subScene.internalOffset.pxRow + this.subScene.internalHeight/2
        }
    }

    getInternalBoundWidth(): number {
        return this.subScene.internalWidth;
    }
    getInternalBoundHeight(): number {
        return this.subScene.internalHeight;
    }
}