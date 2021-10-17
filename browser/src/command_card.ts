import { TowerType } from "entropy-td-core/lib/friendly/tower";
import { PlayerEventHandler } from "./events/player_event_handler";

export abstract class CommandCard {
    id: string;
    items: CommandCardItem[];
    playerEventHandler: PlayerEventHandler;

    constructor(id: string, items: CommandCardItem[], playerEventHandler: PlayerEventHandler) {
        this.id = id;
        this.items = items;
        this.playerEventHandler = playerEventHandler;
    }


    abstract handleKeyboardEvent(event: KeyboardEvent):void;
}

export class TowerListCommandCard extends CommandCard {
    towerTypes: TowerType[];

    constructor(towerTypes: TowerType[], playerEventHandler: PlayerEventHandler) {
        let cardItems = towerTypes.map(towerType => towerCommandCardItem(towerType));
        super("tower_selector", cardItems, playerEventHandler);
        this.towerTypes = towerTypes;
    }

    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.code.includes("Key")) {
            let selectedTowerType = this.towerTypes.find(
                towerType => towerType.hotkey.toLowerCase() === event.code.replace("Key","").toLowerCase());
            if (selectedTowerType) {
                this.playerEventHandler.selectTowerTypeForHover(selectedTowerType);
            }
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
