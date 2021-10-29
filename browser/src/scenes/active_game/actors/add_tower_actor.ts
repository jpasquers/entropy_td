import { ActionHandler } from "entropy-td-core/lib/actions/action_handler";
import { TowerType } from "entropy-td-core/lib/friendly/tower";
import { PixelCoordinate } from "entropy-td-core/lib/game_board";
import { ActiveGameScene } from "..";
import { ActionBridge } from "../../../common/actor";
import { ClickEvent, ClickObserver } from "../../../common/publishers/input";
import { TerrainRenderer } from "../renderers/board";
import { ErrorRenderer } from "../renderers/error";


export class AddTowerActor extends ActionBridge<ActiveGameScene> implements ClickObserver {

    towerType: TowerType;
    id: string;

    constructor(scene: ActiveGameScene, towerType: TowerType, onSuccess?:()=>void) {
        super(scene.gameController.actor(),scene, onSuccess);
        this.towerType = towerType;
        this.id = `add_tower_actor_${this.towerType.name}`;
    }

    onEvent(event: ClickEvent): void {
        let pixel: PixelCoordinate = event.targetPos;
        if (this.scene.terrainRenderer.isPixelRelated(pixel)) {
            let coord = this.scene.terrainRenderer.getTileCoordForRenderedPixel(pixel);
            if (this.scene.gameController.gameBoard.isOpen(coord) && this.towerType) {
                this.attemptAction(() => {
                    this.actionHandler.addTower(coord, this.towerType);
                })
            }
        }
    }
    
}