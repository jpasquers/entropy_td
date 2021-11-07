
import { TowerType } from "entropy-td-core";
import { PixelCoordinate } from "entropy-td-core";
import { ActiveGameScene } from "..";
import { ActionBridge } from "../../../common/actor";
import { ClickEvent, ClickObserver } from "../../../common/publishers/input";


export class AddTowerActor extends ActionBridge<ActiveGameScene> implements ClickObserver {

    towerType: TowerType;
    id: string;

    constructor(scene: ActiveGameScene, towerType: TowerType, onSuccess?:()=>void) {
        super(scene.gameController.actor(),scene, onSuccess);
        this.towerType = towerType;
        this.id = `add_tower_actor_${this.towerType.name}`;
    }

    onEvent(event: ClickEvent): void {
        let gamePos: PixelCoordinate = this.scene.mapCameraPosToGamePos(event.targetCameraPos);
        if (this.scene.terrainRenderer!.isPixelRelated(gamePos)) {
            let coord = this.scene.terrainRenderer!.getTileCoordForRenderedPixel(gamePos);
            if (this.scene.gameController.gameBoard.isOpen(coord) && this.towerType) {
                this.attemptAction(() => {
                    this.actionHandler.addTower(coord, this.towerType);
                })
            }
        }
    }
    
}