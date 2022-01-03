import { LiveTower, TowerType } from "entropy-td-core";
import { isIncremental } from "entropy-td-core/lib/config";
import { Upgrade } from "entropy-td-core/lib/friendly/tower";
import { KeyDownEvent, KeyDownObserver } from "../../../common/publishers/input";

export abstract class CommandCard implements KeyDownObserver{
    id: string;
    items: CommandCardItem[];

    constructor(id: string, items: CommandCardItem[]) {
        this.id = id;
        this.items = items;
    }

    abstract onEvent(event: KeyDownEvent): void;

}

export class TowerCommandCard extends CommandCard {

    tower: LiveTower;
    sellCardItem: CommandCardItem;
    sellTower: (tower: LiveTower)=>void;
    upgradeTower: (tower: LiveTower, upgrade: Upgrade)=>void;
    constructor(tower: LiveTower,
        sellTower: (tower: LiveTower)=>void,
        upgradeTower: (tower: LiveTower, upgrade: Upgrade)=>void) {
        let sellCardItem = sellTowerCardItem(tower);
        super(`tower_card_${tower.id}`,[sellCardItem]);
        this.sellCardItem = sellCardItem;
        this.sellTower = sellTower;
        this.upgradeTower = upgradeTower;
        this.tower = tower;
    }

    onEvent(event: KeyDownEvent): void {
        if (event.key.toLowerCase() === this.sellCardItem.hotkey.toLowerCase()) {
            this.sellTower(this.tower);
        }
        //AHHHH
        let upgrade = this.tower.availableUpgrades.find((availableUpgrade => true))
    }
}

export class GlobalCommandCard extends CommandCard {
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

export enum Orientation {
    TopLeft,
    BottomRight
}

export interface CommandCardItem {
    id: string;
    hotkey: string;
    subText?: string;
    assetKey: string;
    orientation: Orientation;
}

export const sellTowerCardItem = (tower: LiveTower): CommandCardItem => {
    return {
        id: `sell_tower_${tower.id}`,
        hotkey: 'S', //personal settings?
        orientation: Orientation.BottomRight,
        assetKey: 'sell_tower'
    }
}

// export const upgradeTower = (upgrade: Upgrade): CommandCardItem => {
//     if (isIncremental(upgrade.config)) {
        
//     }
//     else {

//     }
//     return null;
// }

export const towerCommandCardItem = (tower: TowerType): CommandCardItem => {
    return {
        id: `tower_${tower.name}`,
        hotkey: tower.hotkey,
        assetKey: `tower_${tower.name}_command_card`,
        orientation: Orientation.TopLeft
    }
}