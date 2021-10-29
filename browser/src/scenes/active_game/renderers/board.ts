import { GameBoard } from "entropy-td-core";
import { Tower } from "entropy-td-core/lib/friendly/tower";
import { Coordinate, PixelCoordinate, Tile, TileType } from "entropy-td-core/lib/game_board";
import { GameState } from "entropy-td-core/lib/orchestrator";
import { GameStateObjectRenderer } from ".";
import { GameObjectLike, ObjectRendererWithSync } from "../../../common/renderer";
import { DisplayContext, SubSceneDisplayContext } from "../../../phaser/extensions/display_context";
import { BorderedSubScene } from "../../../phaser/extensions/sub_scene";

export class Terrain implements GameObjectLike {
    terrainTiles: Phaser.GameObjects.Image[][];
    constructor(terrainTiles: Phaser.GameObjects.Image[][]) {
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
    
    constructor(subScene: BorderedSubScene, tileDim: number) {
        super( {
            withCleanup: false,
            alwaysCreate: false
        }, new SubSceneDisplayContext(subScene))
        this.tileDim = tileDim;
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
        else return this.renderImageAtTileCoord(coord, 'grass');
    }

    renderImageAtTileCoord(coord: Coordinate,imageKey: string): Phaser.GameObjects.Image {
        return this.displayContext.addImage(
            tileTopLeft(coord.row, coord.col,this.tileDim ), 
            this.tileDim, 
            imageKey
        );
    }

    updateImageToTileCoord(coord: Coordinate, image: Phaser.GameObjects.Image): void {
        this.displayContext.setXPos(image, tileCenterX(coord.col,this.tileDim));
        this.displayContext.setYPos(image, tileCenterY(coord.row,this.tileDim));
    }
    
}

export class TowerRenderer extends GameStateObjectRenderer<Tower, Phaser.GameObjects.Image> {
    towerDim: number;

    constructor(subScene: BorderedSubScene, towerDim: number) {
        super({
            alwaysCreate: false,
            withCleanup: true
        }, new SubSceneDisplayContext(subScene), "tower_renderer");
        this.towerDim = towerDim;
    }

    getModels(gameState: GameState): Tower[] {
        return gameState.towers;
    }
    
    create(tower: Tower): Phaser.GameObjects.Image {
        return this.displayContext.addImage(
            tileTopLeft(tower.pos.row,tower.pos.col,this.towerDim),
            this.towerDim,
            `tower_${tower.type.name}`
        );
    }

    update(item: Tower, phaserObj: Phaser.GameObjects.Image): void {
        //No op for now;
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
