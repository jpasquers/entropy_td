import { GameBoard } from "entropy-td-core";
import { ActiveCreep } from "entropy-td-core/lib/enemy/creep";
import {  GameObjectLike, BorderedSceneSubSection, SubSectionRenderer } from ".";

export class CreepDisplay implements GameObjectLike {
    creepBody: Phaser.GameObjects.Arc;
    healthBox: Phaser.GameObjects.Rectangle;
    healthBar: Phaser.GameObjects.Rectangle;
    sceneSection: BorderedSceneSubSection;

    CREEP_RADIUS: number = 25;

    constructor(activeCreep: ActiveCreep, sceneSection: BorderedSceneSubSection) {
        this.creepBody = sceneSection.scene.add.circle(
            activeCreep.pxPos.pxCol + sceneSection.internalOffset.pxCol, 
            activeCreep.pxPos.pxRow + sceneSection.internalOffset.pxRow, 
            this.CREEP_RADIUS,0xff0000);
        this.creepBody.setDepth(3);
        this.healthBox = sceneSection.scene.add.rectangle(
            this.creepBody.x,
            this.creepBody.y - (this.CREEP_RADIUS + 5),
            this.CREEP_RADIUS*2 - 5,
            8
        );
        this.healthBox.setStrokeStyle(2,0x0000000);
        this.healthBox.isFilled = false;
        this.healthBox.setDepth(6);
        this.healthBar = sceneSection.scene.add.rectangle(
            this.creepBody.x,
            this.creepBody.y - (this.CREEP_RADIUS + 5),
            this.pctHealth(activeCreep) * (this.CREEP_RADIUS*2 - 5),
            6,
            0x00ff00
        )
        this.healthBar.setDepth(3);
        this.sceneSection = sceneSection;
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
        this.creepBody.setX(activeCreep.pxPos.pxCol + this.sceneSection.internalOffset.pxCol);
        this.creepBody.setY(activeCreep.pxPos.pxRow + this.sceneSection.internalOffset.pxRow);
        this.healthBox.setX(this.creepBody.x);
        this.healthBox.setY(this.creepBody.y - (this.CREEP_RADIUS + 5));
        this.healthBar.setX(this.creepBody.x);
        this.healthBar.setY(this.creepBody.y - (this.CREEP_RADIUS + 5));
        this.healthBar.width = this.pctHealth(activeCreep) * (this.CREEP_RADIUS*2 - 5);
    }

}

export class CreepRenderer extends SubSectionRenderer<ActiveCreep, CreepDisplay> {
    constructor(scene: BorderedSceneSubSection) {
        super(scene, {
            alwaysCreate: false,
            withCleanup: true
        })
    }

    create(activeCreep: ActiveCreep): CreepDisplay {
        return new CreepDisplay(activeCreep, this.sceneSection);
    }
    update(activeCreep: ActiveCreep, phaserObj: CreepDisplay): void {
        phaserObj.update(activeCreep);
    }
}