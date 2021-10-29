import { TowerType } from "entropy-td-core/lib/friendly/tower";
import { KeyDownEvent, KeyDownObserver } from "../../common/publishers/input";
import { TowerSilhoutteRenderer } from "./renderers/tower_silhoutte";

export abstract class CommandCard implements KeyDownObserver{
    id: string;
    items: CommandCardItem[];

    constructor(id: string, items: CommandCardItem[]) {
        this.id = id;
        this.items = items;
    }

    abstract onEvent(event: KeyDownEvent): void;

}

export class TowerListCommandCard extends CommandCard {
    towerTypes: TowerType[];
    onTowerSelected: (type: TowerType)=>void;

    constructor(towerTypes: TowerType[],
        onTowerSelected: (type: TowerType)=>void) {
        let cardItems = towerTypes.map(towerType => towerCommandCardItem(towerType));
        super("tower_selector", cardItems);
        this.towerTypes = towerTypes;
        this.onTowerSelected = onTowerSelected;
    }

    onEvent(event: KeyDownEvent): void {
        let selectedTowerType = this.towerTypes.find(
            towerType => towerType.hotkey.toLowerCase() === event.key.toLowerCase()
        );
        if (selectedTowerType) {
            this.onTowerSelected(selectedTowerType);
        }
    }
}

export interface CommandCardItem {
    id: string;
    hotkey: string;
    assetKey: string;
}

export const towerCommandCardItem = (tower: TowerType): CommandCardItem => {
    return {
        id: `tower_${tower.name}`,
        hotkey: tower.hotkey,
        assetKey: `tower_${tower.name}_card`
    }
}