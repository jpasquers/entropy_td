import { GameObjectLike, ObjectRendererWithSync } from "../../../../common/renderer";
import { SIT_ON_FIXED_LAYER } from "../../../../common/z_layers";
import { COMMAND_CARD_WIDTH, COMMAND_CARD_ITEM_DIM_PADDED, COMMAND_CARD_HEIGHT } from "../../../../display_configs";
import { DisplayContext, forSubScene } from "../../../../phaser/extensions/display_context";
import { SubScene } from "../../../../phaser/extensions/sub_scene";
import { CommandCardItem, CommandCard, Orientation } from "../command_card";

const ITEM_PAD = 7;

export class CommandCardItemDisplay implements GameObjectLike {
    sprite: Phaser.GameObjects.Sprite;
    hotkey: Phaser.GameObjects.Text;
    subText?: Phaser.GameObjects.Text;

    constructor(commandCardItem: CommandCardItem, displayContext: DisplayContext, idx: number) {
        let numCols = Math.floor(COMMAND_CARD_WIDTH / COMMAND_CARD_ITEM_DIM_PADDED);
        let col = idx % numCols;
        let row = Math.floor(idx / numCols);
        let externalOffsetCol = col*COMMAND_CARD_ITEM_DIM_PADDED;
        let externalOffsetRow = row*COMMAND_CARD_ITEM_DIM_PADDED
        this.sprite = displayContext.addSprite({
            pxCol: externalOffsetCol + ITEM_PAD,
            pxRow: externalOffsetRow + ITEM_PAD
        }, COMMAND_CARD_ITEM_DIM_PADDED - ITEM_PAD, COMMAND_CARD_ITEM_DIM_PADDED - ITEM_PAD, commandCardItem.assetKey);
        this.sprite.setDepth(SIT_ON_FIXED_LAYER);
        this.hotkey = displayContext.addTextStartingAt({
            pxCol: externalOffsetCol + ITEM_PAD + 2,
            pxRow: externalOffsetRow + ITEM_PAD + 2
        },
            commandCardItem.hotkey.toUpperCase()
        );
        this.hotkey.setFontSize(COMMAND_CARD_ITEM_DIM_PADDED / 3);
        this.hotkey.setColor("white");
        this.hotkey.setDepth(SIT_ON_FIXED_LAYER);
    }

    destroy() {
        this.sprite.destroy();
        this.hotkey.destroy();
        this.subText?.destroy();
    }
}

export class CommandCardDisplay implements GameObjectLike {
    items: CommandCardItemDisplay[];
    constructor(commandCard: CommandCard, displayContext: DisplayContext) {
        let fromFrontIdx = 0;
        let fromBackIdx = (totalCommandCardItems()-1);
        this.items = commandCard.items.map((item,idx) => {
            let effectiveIdx = item.orientation === Orientation.TopLeft
                ? fromFrontIdx++
                : fromBackIdx--;
            return new CommandCardItemDisplay(item,displayContext,effectiveIdx)   
        });
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

const totalCommandCardItems = (): number => {
    return (COMMAND_CARD_WIDTH / COMMAND_CARD_ITEM_DIM_PADDED) * (COMMAND_CARD_HEIGHT / COMMAND_CARD_ITEM_DIM_PADDED);
}