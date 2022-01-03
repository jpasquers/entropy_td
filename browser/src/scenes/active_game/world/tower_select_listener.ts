import { LiveTower } from "entropy-td-core";
import { coordsEqual } from "entropy-td-core/lib/common/utils";
import { ClickEvent, ClickObserver } from "../../../common/publishers/input";
import { GameStatePublisher } from "../gamestate_publisher";
import { TerrainRenderer } from "./renderers/board";

let ID=0;
export class TowerSelectListener implements ClickObserver {
    id: string;
    terrainRenderer: TerrainRenderer;
    onSelect: (tower: LiveTower)=>void;
    gameStatePublisher: GameStatePublisher;

    constructor(onSelect: (tower: LiveTower)=>void, terrainRenderer: TerrainRenderer,
        gameStatePublisher: GameStatePublisher ) {
        this.id = 'tower_select_listener';
        this.onSelect = onSelect;
        this.terrainRenderer = terrainRenderer;
        this.gameStatePublisher = gameStatePublisher;
    }

    onEvent(event: ClickEvent): void {
        console.log(event);
        if (this.terrainRenderer!.isPixelRelated(event.targetWorldPos)) {
            let coord = this.terrainRenderer!.getTileCoordForRenderedPixel(event.targetWorldPos);
            let state = this.gameStatePublisher.getReference()!;
            let tower = state.towers.find(tower => tower.coords.some(towerCoord => coordsEqual(coord,towerCoord)));
            if (tower) {
                this.onSelect(tower);
            }
        }
    }

}