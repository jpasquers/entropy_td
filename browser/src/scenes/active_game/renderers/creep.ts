import { GameBoard } from "entropy-td-core";
import { ActiveCreep, Creep } from "entropy-td-core";
import { GameState } from "entropy-td-core";
import { GameStateObjectRenderer } from ".";
import {  GameObjectLike } from "../../../common/renderer";
import { DisplayContext, SubSceneDisplayContext } from "../../../phaser/extensions/display_context";
import { BorderedSubScene } from "../../../phaser/extensions/sub_scene";

export class CreepDisplay implements GameObjectLike {
    creepBody: Phaser.GameObjects.Arc;
    healthBox: Phaser.GameObjects.Rectangle;
    healthBar: Phaser.GameObjects.Rectangle;
    displayContext: DisplayContext;

    CREEP_RADIUS: number = 20;

    constructor(activeCreep: ActiveCreep, displayContext: DisplayContext) {
        this.creepBody = displayContext.addCircle(
            activeCreep.pxPos,
            this.CREEP_RADIUS,
            0xff0000
        );
        this.creepBody.setDepth(6);
        this.healthBox = displayContext.addRectangle({
            pxCol: activeCreep.pxPos.pxCol - (this.CREEP_RADIUS-3),
            pxRow: activeCreep.pxPos.pxRow - (this.CREEP_RADIUS + 9)
        },this.CREEP_RADIUS*2 - 5,
        8);
        this.healthBox.setStrokeStyle(2,0xaaaaaa);
        this.healthBox.isFilled = false;
        this.healthBox.setDepth(6);
        this.healthBar = displayContext.addRectangle({
            pxCol: activeCreep.pxPos.pxCol - (this.CREEP_RADIUS-2),
            pxRow: activeCreep.pxPos.pxRow - (this.CREEP_RADIUS + 8),
            },this.pctHealth(activeCreep) * (this.CREEP_RADIUS*2 - 5),
        6,0x00ff00);
        this.healthBar.setDepth(6);
        this.displayContext = displayContext;
    }

    destroy(): void {
        this.creepBody.destroy();
        this.healthBox.destroy();
        this.healthBar.destroy();
    }

    pctHealth(activeCreep: ActiveCreep): number {
        return activeCreep.health / activeCreep.maxHealth;
    }

    update(activeCreep: ActiveCreep) {
        this.displayContext.setXPos(this.creepBody, activeCreep.pxPos.pxCol);
        this.displayContext.setYPos(this.creepBody, activeCreep.pxPos.pxRow);
        this.displayContext.setXPos(this.healthBox, activeCreep.pxPos.pxCol);
        this.displayContext.setYPos(this.healthBox, activeCreep.pxPos.pxRow - (this.CREEP_RADIUS + 5));
        this.displayContext.setXPos(this.healthBar, activeCreep.pxPos.pxCol);
        this.displayContext.setYPos(this.healthBar, activeCreep.pxPos.pxRow - (this.CREEP_RADIUS + 5));
        this.healthBar.width = this.pctHealth(activeCreep) * (this.CREEP_RADIUS*2 - 5);
    }

}

export class CreepRenderer extends GameStateObjectRenderer<ActiveCreep, CreepDisplay> {
    constructor(subScene: BorderedSubScene) {
        super({
            alwaysCreate: false,
            withCleanup: true
        }, new SubSceneDisplayContext(subScene), "creep_renderer");
    }

    getModels(gameState: GameState): ActiveCreep[] {
        return gameState.activeCreeps;
    }

    create(activeCreep: ActiveCreep): CreepDisplay {
        return new CreepDisplay(activeCreep, this.displayContext);
    }
    update(activeCreep: ActiveCreep, phaserObj: CreepDisplay): void {
        phaserObj.update(activeCreep);
    }
}