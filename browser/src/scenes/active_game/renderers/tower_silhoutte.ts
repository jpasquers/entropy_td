import { GameOrchestrator } from "entropy-td-core";
import { TowerType } from "entropy-td-core";
import { Coordinate, PixelCoordinate } from "entropy-td-core";
import { ActiveGameScene } from "..";
import { MouseMovement, MouseMovementObserver } from "../../../common/publishers/input";
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
    scene: ActiveGameScene;
    
    constructor(scene: ActiveGameScene, towerType?: TowerType) {
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
        let globalPos = this.scene.mapCameraPosToGamePos(event.newCameraPos);
        if (!this.scene.terrainRenderer!.isPixelRelated(globalPos)) return;
        let newCoord = this.scene.terrainRenderer!.getTileCoordForRenderedPixel(globalPos);
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