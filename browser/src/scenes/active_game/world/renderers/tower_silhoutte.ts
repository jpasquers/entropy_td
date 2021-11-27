import { GameOrchestrator } from "entropy-td-core";
import { TowerType } from "entropy-td-core";
import { Coordinate, PixelCoordinate } from "entropy-td-core";
import { ActiveGameWorldScene } from "..";
import { MouseMovementObserver, MouseMovement } from "../../../../common/publishers/input";
import { ActiveGameWorldGrid } from "../../scene_grid";
import { TerrainRenderer, StaticTowerDisplay, TowerRenderer } from "./board";



export interface TowerSilhoutte {
    towerType: TowerType;
    coord: Coordinate;
}


//TODO could this be a standard renderer?
export class TowerSilhoutteRenderer implements MouseMovementObserver {
    id: string;
    towerType?: TowerType;
    currentSilhoutteDisplay?: StaticTowerDisplay
    scene: ActiveGameWorldScene;
    
    constructor(scene: ActiveGameWorldScene, towerType?: TowerType) {
        this.towerType = towerType;
        this.id = "tower_silhoutte_renderer";
        this.scene = scene;

    }

    createDisplay(silhoutte: TowerSilhoutte) {
        this.currentSilhoutteDisplay = this.scene.towerRenderer!.renderTowerSilhoutte(silhoutte!.coord, this.towerType!)
        this.currentSilhoutteDisplay!.towerBackground.setAlpha(0.3);
        this.currentSilhoutteDisplay!.towerSprite.setAlpha(0.3);
    }

    updateDisplay(silhoutte: TowerSilhoutte) {
        this.scene.towerRenderer!.updateTowerSilhoutte(silhoutte.coord, this.currentSilhoutteDisplay!);

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
        if (!this.scene.terrainRenderer!.isPixelRelated(event.newWorldPos)) return;
        let newCoord = this.scene.terrainRenderer!.getTileCoordForRenderedPixel(event.newWorldPos);
        if (!this.scene.gameController.getBoard().isOpen(newCoord)) return;
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