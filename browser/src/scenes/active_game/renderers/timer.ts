import { GameState } from "entropy-td-core";
import { GameStateObjectRenderer } from ".";
import { SimpleRenderer, WithIdentifier } from "../../../common/renderer";
import { SubSceneDisplayContext } from "../../../phaser/extensions/display_context";
import { BorderedSubScene } from "../../../phaser/extensions/sub_scene";
import { GameStateObserver } from "../gamestate_publisher";

export class TimeRenderer extends SimpleRenderer<Phaser.GameObjects.Text> implements GameStateObserver {
    id: string;
    timer?: Phaser.GameObjects.Text;

    constructor(subScene: BorderedSubScene) {
        super(new SubSceneDisplayContext(subScene));
        this.id = "time_renderer";
    }

    onEvent(event: GameState): void {
        let time = event.timeBeforeWaveSec;
        let dispTime = time >= 0 ? time : 0;
        if (!this.timer) {
            this.timer = this.displayContext.addTextStartingAt({pxCol: 20,pxRow: 20}, `Next Wave: ${dispTime}`);
            this.timer.setFontSize(35);
        }
        else {
            this.timer.setText(`Next Wave: ${dispTime}`);
        }
    }
    
}

export class MoneyRenderer extends SimpleRenderer<Phaser.GameObjects.Text> implements GameStateObserver {
    id: string;
    moneyDisplay?: Phaser.GameObjects.Text;

    constructor(subScene: BorderedSubScene) {
        super(new SubSceneDisplayContext(subScene));
        this.id = "money_renderer";
    }

    onEvent(event: GameState): void {
        if (!this.moneyDisplay) {
            this.moneyDisplay = this.displayContext.addTextStartingAt({pxCol: 400, pxRow:20}, "");
            this.moneyDisplay.setFontSize(35);
        }
        this.moneyDisplay.setText(`Money: $${event.money}`);
    }
    
}