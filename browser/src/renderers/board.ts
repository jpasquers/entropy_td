import { GameBoard } from "entropy-td-core";
import { Tower } from "entropy-td-core/lib/friendly/tower";
import { Coordinate, PixelCoordinate, Tile, TileType } from "entropy-td-core/lib/game_board";
import { GameObjectLike, RenderWithOffset, BorderedSceneSubSection, SubSectionRenderer } from ".";

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

export class TerrainRenderer extends SubSectionRenderer<GameBoard, Terrain> {

    tileDim: number;
    
    constructor(sceneSection: BorderedSceneSubSection, tileDim: number) {
        super(sceneSection, {
            withCleanup: false,
            alwaysCreate: false
        })
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

    getTileCoordForRenderedPixel(pixel: PixelCoordinate): Coordinate {
        let coord = {
            row: Math.floor((pixel.pxRow - this.sceneSection.internalOffset.pxRow) / this.tileDim),
            col: Math.floor((pixel.pxCol - this.sceneSection.internalOffset.pxCol) / this.tileDim)
        }
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

    tileCenterX(colNum: number): number {
        return this.sceneSection.internalOffset.pxCol + colNum*this.tileDim + 0.5*this.tileDim;
    }

    tileCenterY(rowNum: number): number {
        return this.sceneSection.internalOffset.pxRow + rowNum*this.tileDim + 0.5*this.tileDim; 
    }
    
    renderTile(coord: Coordinate, tile: Tile): Phaser.GameObjects.Image {
        if (tile.type === TileType.Start) return this.renderImageAtTileCoord(coord, 'start');
        else if (tile.type === TileType.Checkpoint) return this.renderImageAtTileCoord(coord, `checkpoint_${tile.checkPointNum}`);
        else if (tile.type === TileType.Finish) return this.renderImageAtTileCoord(coord, 'finish');
        else if (tile.type === TileType.Rock) return this.renderImageAtTileCoord(coord, 'rock');
        else return this.renderImageAtTileCoord(coord, 'grass');
    }

    renderImageAtTileCoord(coord: Coordinate,imageKey: string): Phaser.GameObjects.Image {
        let image = this.sceneSection.scene.add.image(
            tileCenterX(coord.col, this.tileDim, this.sceneSection.internalOffset.pxCol), 
            tileCenterY(coord.row, this.tileDim, this.sceneSection.internalOffset.pxRow), 
            imageKey
        );
       image.displayHeight = this.tileDim;
       image.displayWidth = this.tileDim;
       return image;
    }
    
}

export class TowerRenderer extends SubSectionRenderer<Tower, Phaser.GameObjects.Image> {
    towerDim: number;

    constructor(scene: BorderedSceneSubSection, towerDim: number) {
        super(scene, {
            alwaysCreate: false,
            withCleanup: true
        });
        this.towerDim = towerDim;
    }
    
    create(tower: Tower): Phaser.GameObjects.Image {
        let towerGameObj = this.sceneSection.scene.add.image(
            tileCenterX(tower.pos.col, this.towerDim, this.sceneSection.internalOffset.pxCol),
            tileCenterY(tower.pos.row, this.towerDim, this.sceneSection.internalOffset.pxRow),
            `tower_${tower.type.name}`
        );
        towerGameObj.displayHeight = this.towerDim;
        towerGameObj.displayWidth = this.towerDim;
        return towerGameObj;
    }

    update(item: Tower, phaserObj: Phaser.GameObjects.Image): void {
        //No op for now;
    }
    
}

const tileCenterX = (colNum: number, dim: number, colOffset: number): number => {
    return colOffset + colNum*dim + 0.5*dim;
}

const tileCenterY = (rowNum: number, dim: number, rowOffset: number): number => {
    return rowOffset + rowNum*dim + 0.5*dim;
}
