import { GameBoard } from "entropy-td-core";
import { ActiveCreep } from "entropy-td-core";
import { LiveTower, TowerType } from "entropy-td-core";
import { Coordinate, PixelCoordinate, Tile, TileType } from "entropy-td-core";
import { GameState } from "entropy-td-core";
import { Game } from "phaser";
import { GameStateObjectRenderer } from ".";
import { GameObjectLike, NoOp, ObjectRendererWithSync } from "../../../common/renderer";
import { calculateAngleRad } from "../../../common/util";
import { TOWER_COLOR } from "../../../display_configs";
import { CanSetPos, DisplayContext, forSubScene } from "../../../phaser/extensions/display_context";
import { SubScene } from "../../../phaser/extensions/sub_scene";

export class Terrain implements GameObjectLike {
    terrainTiles: (Phaser.GameObjects.Image )[][];
    constructor(terrainTiles: (Phaser.GameObjects.Image )[][]) {
        this.terrainTiles = terrainTiles;
    }

    destroy() {
        this.terrainTiles.forEach(row => {
            row.forEach(tile => tile.destroy());
        })
    }
}

export class TerrainRenderer extends ObjectRendererWithSync<GameBoard, Terrain> {
    tileDim: number;
    
    constructor(subScene: SubScene, tileDim: number) {
        super( {
            withCleanup: false,
            alwaysCreate: false
        }, forSubScene(subScene))
        this.tileDim = tileDim;
    }

    renderBackgroundTerrain() {
        this.displayContext.addImage(
            {pxCol: 0, pxRow: 0},
            this.displayContext.getInternalBoundWidth(),
            this.displayContext.getInternalBoundHeight(),
            "space_background"
        )
    }
    
    create(board: GameBoard): Terrain {
        let tiles =  board.terrain.map((tileRow, rowNum) => {
            return tileRow.map((tile, colNum) => {
                let terrainPiece = this.renderTile({
                    row: rowNum,
                    col: colNum
                }, tile);
                terrainPiece.setInteractive();
                return terrainPiece;
            })
        })
        return new Terrain(tiles);
    }

    update(item: GameBoard, phaserObj: Terrain): void {
        throw new Error("Terrain creation is one off. Should not execute.");
    }

    getTileCoordForRenderedPixel(globalPixel: PixelCoordinate): Coordinate {
        let pixelsWithinContext = this.displayContext.scopeGlobalToContext(globalPixel);
        let coord = {
            row: Math.floor(pixelsWithinContext.pxRow / this.tileDim),
            col: Math.floor(pixelsWithinContext.pxCol / this.tileDim)
        };
        if (coord.row < 0 
            || coord.col < 0 
            || coord.col >= this.currentModels[0].numCols()
            || coord.row >= this.currentModels[0].numRows()) {
            throw new Error("Selected pixel is outside coordinate range")
        }
        return coord;
    }

    isPixelRelated(pixel: PixelCoordinate): boolean {
        try {
            this.getTileCoordForRenderedPixel(pixel);
            return true;
        }
        catch(e) { return false;}
    }

    tileCenterX (colNum: number): number {
        return colNum*this.tileDim + 0.5*this.tileDim;
    }

    tileCenterY (rowNum: number): number {
        return rowNum*this.tileDim + 0.5*this.tileDim;
    }
    
    renderTile(coord: Coordinate, tile: Tile): Phaser.GameObjects.Image {
        if (tile.type === TileType.Start) return this.renderImageAtTileCoord(coord, 'start');
        else if (tile.type === TileType.Checkpoint) return this.renderImageAtTileCoord(coord, `checkpoint_${tile.checkPointNum}`);
        else if (tile.type === TileType.Finish) return this.renderImageAtTileCoord(coord, 'finish');
        else if (tile.type === TileType.Rock) return this.renderImageAtTileCoord(coord, 'rock');
        else {
            let image = this.renderImageAtTileCoord(coord, 'empty');
            image.setAlpha(0.01);
            return image;
        }
    }



    renderImageAtTileCoord(coord: Coordinate,imageKey: string): Phaser.GameObjects.Image {
        return this.displayContext.addImage(
            tileTopLeft(coord.row, coord.col,this.tileDim ), 
            this.tileDim, this.tileDim,
            imageKey
        );
    }

    updateImageToTileCoord(coord: Coordinate, image: Phaser.GameObjects.Image): void {
        this.displayContext.setXPos(image, tileCenterX(coord.col,this.tileDim));
        this.displayContext.setYPos(image, tileCenterY(coord.row,this.tileDim));
    }
    
}

export class StaticTowerDisplay implements GameObjectLike, CanSetPos {
    towerSprite: Phaser.GameObjects.Sprite;
    towerBackground: Phaser.GameObjects.Rectangle;
    pos: PixelCoordinate;

    constructor(coord: Coordinate,towerType: TowerType , displayContext: DisplayContext, towerDim: number) {
        this.pos = {
            pxCol: tileCenterX(coord.col, towerDim),
            pxRow: tileCenterY(coord.row, towerDim)
        }
        this.towerSprite = displayContext.addSprite(
            tileTopLeft(coord.row,coord.col,towerDim),
            towerDim, towerDim,
            `tower_${towerType.name}`
        );
        this.towerBackground = displayContext.addRectangle(
            tileTopLeft(coord.row,coord.col,towerDim),
            towerDim, towerDim
        );
        this.towerBackground.setStrokeStyle(2, TOWER_COLOR);
    }
    setX(x: number): void {
        this.towerBackground.setX(x);
        this.towerSprite.setX(x);
    }
    setY(y: number): void {
        this.towerBackground.setY(y);
        this.towerSprite.setY(y);
    }

    destroy() {
        this.towerBackground.destroy();
        this.towerSprite.destroy();
    }
}

export class LiveTowerDisplay extends StaticTowerDisplay {

    constructor(tower: LiveTower, displayContext: DisplayContext, towerDim: number) {
        super(tower.pos, tower.type, displayContext, towerDim);
        
    }

    orientToCreep(creep: ActiveCreep): void {
        this.towerSprite.setRotation(calculateAngleRad(this.pos,creep.pxPos));
    }

    destroy() {
        this.towerBackground.destroy();
        this.towerSprite.destroy();
    }
}

//I should probably make a separate tower silhoutte renderer. But im lazy.
export class TowerRenderer extends GameStateObjectRenderer<LiveTower, LiveTowerDisplay> {
    towerDim: number;

    constructor(subScene: SubScene, towerDim: number) {
        super({
            alwaysCreate: false,
            withCleanup: true
        }, forSubScene(subScene), "tower_renderer");
        this.towerDim = towerDim;
    }

    getModels(gameState: GameState): LiveTower[] {
        return gameState.towers;
    }

    renderTowerSilhoutte(coord: Coordinate, type: TowerType): StaticTowerDisplay {
        return new StaticTowerDisplay(coord, type, this.displayContext,this.towerDim);
    }

    updateTowerSilhoutte(coord: Coordinate, display: StaticTowerDisplay): void {
        this.displayContext.setXPos(display, tileCenterX(coord.col,this.towerDim));
        this.displayContext.setYPos(display, tileCenterY(coord.row,this.towerDim));
    }
    
    create(tower: LiveTower): LiveTowerDisplay {
        return new LiveTowerDisplay(tower, this.displayContext, this.towerDim);
    }

    update(tower: LiveTower, phaserObj: LiveTowerDisplay): void {
        let orientingCreep = tower.targettedCreep ?? this.mostRecentGameState?.activeCreeps?.[0];
        if (orientingCreep) {
            phaserObj.orientToCreep(orientingCreep);
        } 
            
    }
    
}

//Without offset, assumes a display context.
const tileTopLeft = (rowNum: number, colNum: number, dim: number): PixelCoordinate => {
    return {
        pxCol: colNum*dim,
        pxRow: rowNum*dim
    }
}

//Without offset, assumes a display context.
const tileCenterX = (colNum: number, dim: number): number => {
    return colNum*dim + 0.5*dim;
}

//Without offset, assumes a display context.
const tileCenterY = (rowNum: number, dim: number): number => {
    return rowNum*dim + 0.5*dim;
}
