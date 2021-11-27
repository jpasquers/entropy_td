import { GameObjectLike, ObjectRendererWithSync } from "../../../../common/renderer";
import { SIT_ON_FIXED_LAYER } from "../../../../common/z_layers";
import { COMMAND_CARD_WIDTH, COMMAND_CARD_ITEM_DIM } from "../../../../display_configs";
import { DisplayContext, forSubScene } from "../../../../phaser/extensions/display_context";
import { SubScene } from "../../../../phaser/extensions/sub_scene";
import { CommandCardItem, CommandCard } from "../command_card";



export class CommandCardItemDisplay implements GameObjectLike {
    sprite: Phaser.GameObjects.Sprite;
    hotkey: Phaser.GameObjects.Text;

    constructor(commandCardItem: CommandCardItem, displayContext: DisplayContext, idx: number) {
        let numCols = Math.floor(COMMAND_CARD_WIDTH / COMMAND_CARD_ITEM_DIM);
        let col = idx % numCols;
        let row = Math.floor(idx / numCols);
        this.sprite = displayContext.addSprite({
            pxCol: col*COMMAND_CARD_ITEM_DIM,
            pxRow: row*COMMAND_CARD_ITEM_DIM
        }, COMMAND_CARD_ITEM_DIM, COMMAND_CARD_ITEM_DIM, commandCardItem.assetKey);
        this.sprite.setDepth(SIT_ON_FIXED_LAYER);
        this.hotkey = displayContext.addTextStartingAt({
            pxCol: col*COMMAND_CARD_ITEM_DIM + 2,
            pxRow: row*COMMAND_CARD_ITEM_DIM + 2
        },
            commandCardItem.hotkey.toUpperCase()
        );
        this.hotkey.setFontSize(COMMAND_CARD_ITEM_DIM / 3);
        this.hotkey.setColor("white");
        this.hotkey.setDepth(SIT_ON_FIXED_LAYER);
    }

    destroy() {
        this.sprite.destroy();
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

    constructor(subScene: SubScene) {
        super({
            alwaysCreate: false,
            withCleanup: true
        }, forSubScene(subScene));
    }

    create(commandCard: CommandCard): CommandCardDisplay {
        return new CommandCardDisplay(commandCard,this.displayContext);
    }

    update(commandCard: CommandCard, phaserObj: CommandCardDisplay): void {
        //No op?
    }

}