import {  ProjectileSummary } from "entropy-td-core";
import { GameState } from "entropy-td-core";
import { GameStateObjectRenderer } from ".";
import { forSubScene } from "../../../phaser/extensions/display_context";
import { SubScene } from "../../../phaser/extensions/sub_scene";

export class ProjectileRenderer extends GameStateObjectRenderer<ProjectileSummary, Phaser.GameObjects.Arc> {
    constructor(subScene: SubScene) {
        super({
            alwaysCreate: false,
            withCleanup: true
        }, forSubScene(subScene), "projectile_renderer");
    }

    getModels(gameState: GameState): ProjectileSummary[] {
        return gameState.projectiles;
    }

    create(projectile: ProjectileSummary): Phaser.GameObjects.Arc {
        let arc = this.displayContext.addCircle({
            pxCol: projectile.pxPos.pxCol, 
            pxRow: projectile.pxPos.pxRow
        }, 5, 0x0000ff);
        arc.setDepth(8);
        return arc;
    }

    update(projectile: ProjectileSummary, phaserObj: Phaser.GameObjects.Arc): void {
        this.displayContext.setXPos(phaserObj, projectile.pxPos.pxCol);
        this.displayContext.setYPos(phaserObj, projectile.pxPos.pxRow);
    }
}