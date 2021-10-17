import { Scene } from "phaser";
import { GameObjectLike, BorderedSceneSubSection, SubSectionRenderer } from ".";
import { CommandCard, CommandCardItem } from "../command_card";


export const COMMAND_CARD_WIDTH = 200;
export const COMMAND_CARD_HEIGHT = 100;
export const COMMAND_CARD_ITEM_WIDTH = 50;
export const COMMAND_CARD_ITEM_HEIGHT = 50;

export class CommandCardItemDisplay implements GameObjectLike {
    image: Phaser.GameObjects.Image;
    hotkey: Phaser.GameObjects.Text;

    constructor(commandCardItem: CommandCardItem, sceneSection: BorderedSceneSubSection, idx: number) {
        let numCols = Math.floor(COMMAND_CARD_WIDTH / COMMAND_CARD_ITEM_WIDTH);
        let col = idx % numCols;
        let row = Math.floor(idx / numCols);
        this.image = sceneSection.scene.add.image(
            sceneSection.internalOffset.pxCol + ((col+0.5)*COMMAND_CARD_ITEM_WIDTH),
            sceneSection.internalOffset.pxRow + ((row+0.5)*COMMAND_CARD_ITEM_WIDTH),
            commandCardItem.assetKey
        );
        this.image.setDepth(1);
        this.image.displayWidth = COMMAND_CARD_ITEM_WIDTH;
        this.image.displayHeight = COMMAND_CARD_ITEM_HEIGHT;
        this.hotkey = sceneSection.scene.add.text(
            sceneSection.internalOffset.pxCol + col*COMMAND_CARD_ITEM_WIDTH + 2,
            sceneSection.internalOffset.pxRow + row*COMMAND_CARD_ITEM_HEIGHT + 2,
            commandCardItem.hotkey.toUpperCase(),
            {
                fontSize: `${COMMAND_CARD_ITEM_WIDTH / 3}px`,
                color: "black"
            }
        );
        this.hotkey.setDepth(2);
    }

    destroy() {
        this.image.destroy();
        this.hotkey.destroy();
    }
}

export class CommandCardDisplay implements GameObjectLike {
    items: CommandCardItemDisplay[];
    constructor(commandCard: CommandCard, sceneSection: BorderedSceneSubSection) {
        this.items = commandCard.items.map((item,idx) => 
            new CommandCardItemDisplay(item,sceneSection,idx));
    }
    
    destroy() {
        this.items.forEach(item => item.destroy());
    }
}

export class CommandCardRenderer extends SubSectionRenderer<CommandCard, CommandCardDisplay>  {

    constructor(scene: BorderedSceneSubSection) {
        super(scene, {
            alwaysCreate: false,
            withCleanup: true
        })
    }

    create(commandCard: CommandCard): CommandCardDisplay {
        return new CommandCardDisplay(commandCard,this.sceneSection);
    }

    update(commandCard: CommandCard, phaserObj: CommandCardDisplay): void {
        //No op?
    }

}