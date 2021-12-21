import { GameBoard, getPxCenter, TILE_SIZE_PX } from "entropy-td-core";
import { ActiveCreep } from "entropy-td-core";
import { LiveTower, TowerType } from "entropy-td-core";
import { Coordinate, PixelCoordinate, Tile, TileType } from "entropy-td-core";
import { GameState } from "entropy-td-core";
import { OccupiesBoard } from "entropy-td-core/lib/gameboard/model";
import { Game } from "phaser";
import { GameStateObjectRenderer } from ".";
import { GameObjectLike, ObjectRendererWithSync } from "../../../../common/renderer";
import { calculateAngleRad } from "../../../../common/util";
import { TOWER_COLOR } from "../../../../display_configs";
import { forSubScene, CanSetPos, DisplayContext } from "../../../../phaser/extensions/display_context";
import { SubScene } from "../../../../phaser/extensions/sub_scene";

export class Terrain implements GameObjectLike {
    terrainTiles: (Phaser.GameObjects.Image )[];
    constructor(terrainTiles: (Phaser.GameObjects.Image )[]) {
        this.terrainTiles = terrainTiles;
    }

    destroy() {
        this.terrainTiles.forEach(tile => {
            tile.destroy();
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
        console.log(this.displayContext.getInternalBoundWidth());
        this.displayContext.addImage(
            {pxCol: 0, pxRow: 0},
            this.displayContext.getInternalBoundWidth(),
            this.displayContext.getInternalBoundHeight(),
            "space_background"
        )
    }
    
    create(board: GameBoard): Terrain {
        console.log(board.config.tilesColCount);
        let tiles = [];
        tiles.push(...board.noBuildBlockers.map(blocker => {
            let image = this.renderImage(blocker, 'nobuild');
            image.setAlpha(0.5);
            return image;
        }))
        tiles.push(this.renderImageAtTileCoord(board.start, 'start'));
        tiles.push(...board.checkpoints.map((checkpoint, i) => {
            return this.renderImageAtTileCoord(checkpoint, `checkpoint_${i+1}`)
        }));
        tiles.push(this.renderImageAtTileCoord(board.finish, 'finish'));
        tiles.push(...board.getAllRockCoords().map(rock => {
            return this.renderImageAtTileCoord(rock, 'rock');
        }));
        tiles.push(...board.getFullyEmptyTiles().map(empty => {
            let image = this.renderImageAtTileCoord(empty, 'empty');
            image.setAlpha(0.01);
            return image;
        }))

        tiles.forEach(tile => tile.setInteractive());
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


    renderImageAtTileCoord(coord: Coordinate,imageKey: string): Phaser.GameObjects.Image {
        return this.displayContext.addImage(
            tileTopLeft(coord.row, coord.col), 
            this.tileDim, this.tileDim,
            imageKey
        );
    }

    renderImage(obj: OccupiesBoard, imageKey: string): Phaser.GameObjects.Image {
        return this.displayContext.addImage(
            tileTopLeft(obj.tlCoord.row, obj.tlCoord.col),
            this.tileDim*obj.size.width, this.tileDim*obj.size.height,
            imageKey
        );
    }

    updateImageToTileCoord(coord: Coordinate, image: Phaser.GameObjects.Image): void {
        this.displayContext.setXPos(image, tileCenterX(coord.col));
        this.displayContext.setYPos(image, tileCenterY(coord.row));
    }
    
}

export class StaticTowerDisplay implements GameObjectLike, CanSetPos {
    towerSprite: Phaser.GameObjects.Sprite;
    towerBackground: Phaser.GameObjects.Rectangle;
    centerPx: PixelCoordinate;
    towerType: TowerType;

    constructor(tlCoord: Coordinate,towerType: TowerType , displayContext: DisplayContext) {
        this.towerType = towerType;
        this.centerPx = getPxCenter(tlCoord, towerType.dim);
        this.towerSprite = displayContext.addSprite(
            tileTopLeft(tlCoord.row,tlCoord.col),
            towerType.dim.width*TILE_SIZE_PX, towerType.dim.height*TILE_SIZE_PX,
            `tower_${towerType.name}`
        );
        this.towerBackground = displayContext.addRectangle(
            tileTopLeft(tlCoord.row,tlCoord.col),
            towerType.dim.width*TILE_SIZE_PX, towerType.dim.height*TILE_SIZE_PX
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

    constructor(tower: LiveTower, displayContext: DisplayContext) {
        super(tower.tlCoord, tower.type, displayContext);
        
    }

    orientToCreep(creep: ActiveCreep): void {
        this.towerSprite.setRotation(calculateAngleRad(this.centerPx,creep.pxPos));
    }

    destroy() {
        this.towerBackground.destroy();
        this.towerSprite.destroy();
    }
}

//I should probably make a separate tower silhoutte renderer. But im lazy.
export class TowerRenderer extends GameStateObjectRenderer<LiveTower, LiveTowerDisplay> {

    constructor(subScene: SubScene) {
        super({
            alwaysCreate: false,
            withCleanup: true
        }, forSubScene(subScene), "tower_renderer");
    }

    getModels(gameState: GameState): LiveTower[] {
        return gameState.towers;
    }

    renderTowerSilhoutte(tlCoord: Coordinate, type: TowerType): StaticTowerDisplay {
        return new StaticTowerDisplay(tlCoord, type, this.displayContext);
    }

    updateTowerSilhoutte(tlCoord: Coordinate, display: StaticTowerDisplay): void {
        console.log(tlCoord);
        console.log(getPxCenter(tlCoord, display.towerType.dim));
        this.displayContext.setXPos(display, getPxCenter(tlCoord, display.towerType.dim).pxCol);
        this.displayContext.setYPos(display, getPxCenter(tlCoord, display.towerType.dim).pxRow);
    }
    
    create(tower: LiveTower): LiveTowerDisplay {
        return new LiveTowerDisplay(tower, this.displayContext);
    }

    update(tower: LiveTower, phaserObj: LiveTowerDisplay): void {
        let orientingCreep = tower.targettedCreep ?? this.mostRecentGameState?.activeCreeps?.[0];
        if (orientingCreep) {
            phaserObj.orientToCreep(orientingCreep);
        } 
            
    }
    
}

//Without offset, assumes a display context.
const tileTopLeft = (rowNum: number, colNum: number): PixelCoordinate => {
    return {
        pxCol: colNum*TILE_SIZE_PX,
        pxRow: rowNum*TILE_SIZE_PX
    }
}

//Without offset, assumes a display context.
const tileCenterX = (colNum: number): number => {
    return colNum*TILE_SIZE_PX + 0.5*TILE_SIZE_PX;
}

//Without offset, assumes a display context.
const tileCenterY = (rowNum: number): number => {
    return rowNum*TILE_SIZE_PX + 0.5*TILE_SIZE_PX;
}
