import { GameOrchestrator } from "entropy-td-core";
import { TowerType } from "entropy-td-core/lib/friendly/tower";
import { Coordinate, PixelCoordinate } from "entropy-td-core/lib/game_board";
import { ActiveGameScene } from "..";
import { MouseMovement, MouseMovementObserver } from "../../../common/publishers/input";
import { TerrainRenderer } from "./board";



export interface TowerSilhoutte {
    towerType: TowerType;
    coord: Coordinate;
}


//TODO could this be a standard renderer?
export class TowerSilhoutteRenderer implements MouseMovementObserver {
    id: string;
    towerType?: TowerType;
    terrainRenderer: TerrainRenderer;
    currentSilhoutteDisplay?: Phaser.GameObjects.Image;
    gameController: GameOrchestrator;
    
    constructor(scene: ActiveGameScene, towerType?: TowerType) {
        this.towerType = towerType;
        this.id = "tower_silhoutte_renderer";
        this.terrainRenderer = scene.terrainRenderer;
        this.gameController = scene.gameController;
    }

    createDisplay(silhoutte: TowerSilhoutte) {
        this.currentSilhoutteDisplay = this.terrainRenderer.renderImageAtTileCoord(
            silhoutte!.coord,
            `tower_${this.towerType!.name}`
        )
        this.currentSilhoutteDisplay!.alpha = 0.3;
    }

    updateDisplay(silhoutte: TowerSilhoutte) {
        this.terrainRenderer.updateImageToTileCoord(silhoutte.coord, this.currentSilhoutteDisplay!);

    }

    enable(towerType: TowerType) {
        this.towerType = towerType;
    }

    disable() {
        this.towerType = undefined;
        this.currentSilhoutteDisplay?.destroy();
        this.currentSilhoutteDisplay = undefined;
    }

    onEvent(event: MouseMovement): void {
        if (!this.towerType) return;
        if (!this.terrainRenderer.isPixelRelated(event.newPosition)) return;
        let newCoord = this.terrainRenderer.getTileCoordForRenderedPixel(event.newPosition);
        if (!this.gameController.getBoard().isOpen(newCoord)) return;
        let silhoutte = {
            coord: newCoord,
            towerType: this.towerType
        }
        
        if (!this.currentSilhoutteDisplay) {
            this.createDisplay(silhoutte);
        }
        else {
            this.updateDisplay(silhoutte);
        }
    }
    
}