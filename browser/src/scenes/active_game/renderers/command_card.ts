import { Scene } from "phaser";
import { GameObjectLike, ObjectRendererWithSync } from "../../../common/renderer";
import { COMMAND_CARD_ITEM_DIM, COMMAND_CARD_WIDTH } from "../../../display_configs";
import { DisplayContext, SubSceneDisplayContext } from "../../../phaser/extensions/display_context";
import { BorderedSubScene } from "../../../phaser/extensions/sub_scene";
import { CommandCard, CommandCardItem } from "../command_card";



export class CommandCardItemDisplay implements GameObjectLike {
    image: Phaser.GameObjects.Image;
    hotkey: Phaser.GameObjects.Text;

    constructor(commandCardItem: CommandCardItem, displayContext: DisplayContext, idx: number) {
        let numCols = Math.floor(COMMAND_CARD_WIDTH / COMMAND_CARD_ITEM_DIM);
        let col = idx % numCols;
        let row = Math.floor(idx / numCols);
        this.image = displayContext.addImage({
            pxCol: col*COMMAND_CARD_ITEM_DIM,
            pxRow: row*COMMAND_CARD_ITEM_DIM
        }, COMMAND_CARD_ITEM_DIM, COMMAND_CARD_ITEM_DIM, commandCardItem.assetKey);
        this.image.setDepth(1);
        this.hotkey = displayContext.addTextStartingAt({
            pxCol: col*COMMAND_CARD_ITEM_DIM + 2,
            pxRow: row*COMMAND_CARD_ITEM_DIM + 2
        },
            commandCardItem.hotkey.toUpperCase()
        );
        this.hotkey.setFontSize(COMMAND_CARD_ITEM_DIM / 3);
        this.hotkey.setColor("black");
        this.hotkey.setDepth(2);
    }

    destroy() {
        this.image.destroy();
        this.hotkey.destroy();
    }
}

export class CommandCardDisplay implements GameObjectLike {
    items: CommandCardItemDisplay[];
    constructor(commandCard: CommandCard, displayContext: DisplayContext) {
        this.items = commandCard.items.map((item,idx) => 
            new CommandCardItemDisplay(item,displayContext,idx));
    }
    
    destroy() {
        this.items.forEach(item => item.destroy());
    }
}

export class CommandCardRenderer extends ObjectRendererWithSync<CommandCard, CommandCardDisplay>  {

    constructor(subScene: BorderedSubScene) {
        super({
            alwaysCreate: false,
            withCleanup: true
        }, new SubSceneDisplayContext(subScene));
    }

    create(commandCard: CommandCard): CommandCardDisplay {
        return new CommandCardDisplay(commandCard,this.displayContext);
    }

    update(commandCard: CommandCard, phaserObj: CommandCardDisplay): void {
        //No op?
    }

}