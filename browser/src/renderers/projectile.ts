import {  ProjectileSummary } from "entropy-td-core/lib/friendly/projectile";
import { SubSectionRenderer, BorderedSceneSubSection } from ".";

export class ProjectileRenderer extends SubSectionRenderer<ProjectileSummary, Phaser.GameObjects.Arc> {
    constructor(scene: BorderedSceneSubSection) {
        super(scene, {
            alwaysCreate: false,
            withCleanup: true
        })
    }

    create(projectile: ProjectileSummary): Phaser.GameObjects.Arc {
        let arc = this.sceneSection.scene.add.circle(
            projectile.pxPos.pxCol + this.sceneSection.internalOffset.pxCol, 
            projectile.pxPos.pxRow + this.sceneSection.internalOffset.pxRow, 
            5,0x0000ff);
        arc.setDepth(3);
        return arc;
    }

    update(projectile: ProjectileSummary, phaserObj: Phaser.GameObjects.Arc): void {
        phaserObj.setX(projectile.pxPos.pxCol + this.sceneSection.internalOffset.pxCol);
        phaserObj.setY(projectile.pxPos.pxRow + this.sceneSection.internalOffset.pxRow);
    }
}