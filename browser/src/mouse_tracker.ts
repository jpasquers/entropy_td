import { GameOrchestrator } from "entropy-td-core";
import { TowerType } from "entropy-td-core/lib/friendly/tower";
import { Coordinate, PixelCoordinate } from "entropy-td-core/lib/game_board";
import { BorderedSceneSubSection } from "./renderers";
import { TerrainRenderer } from "./renderers/board";

export interface MouseMovementListener {
    id: string;
    onMove(newPosition: PixelCoordinate): void;
}

export interface TowerSilhoutte {
    towerType: TowerType;
    coord: Coordinate;
}


//TODO could this be a standard renderer?
export class TowerSilhoutteRenderer implements MouseMovementListener {
    id: string;
    towerType: TowerType;
    terrainRenderer: TerrainRenderer;
    currentSilhoutte?: TowerSilhoutte;
    currentSilhoutteDisplay?: Phaser.GameObjects.Image;
    gameController: GameOrchestrator;
    
    constructor(towerType: TowerType, terrainRenderer: TerrainRenderer,
        gameController: GameOrchestrator) {
        this.towerType = towerType;
        this.id = "tower_silhoutte_renderer";
        this.terrainRenderer = terrainRenderer;
        this.gameController = gameController;
    }

    create() {
        this.currentSilhoutteDisplay = this.terrainRenderer.renderImageAtTileCoord(
            this.currentSilhoutte!.coord,
            `tower_${this.towerType.name}`
        )
        this.currentSilhoutteDisplay!.alpha = 0.3;
    }

    synchronizeDisplay() {
        
    }

    destroy() {
        this.currentSilhoutteDisplay?.destroy();
        this.currentSilhoutteDisplay = undefined;
    }

    onMove(newPosition: PixelCoordinate): void {
        //TODO should cleanup etc etc
        if (!this.terrainRenderer.isPixelRelated(newPosition)) return;
        let newCoord = this.terrainRenderer.getTileCoordForRenderedPixel(newPosition);
        if (!this.gameController.getBoard().isOpen(newCoord)) return;
    
        this.currentSilhoutte = {
            coord: newCoord,
            towerType: this.towerType
        }
        
        if (!this.currentSilhoutteDisplay) {
            this.create();
        }
        else {
            this.currentSilhoutteDisplay.x = this.terrainRenderer.tileCenterX(
                this.currentSilhoutte.coord.col
            );
            this.currentSilhoutteDisplay.y = this.terrainRenderer.tileCenterY(
                this.currentSilhoutte.coord.row
            );
        }
    }
    
}