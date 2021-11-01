import {  ProjectileSummary } from "entropy-td-core";
import { GameState } from "entropy-td-core";
import { GameStateObjectRenderer } from ".";
import { SubSceneDisplayContext } from "../../../phaser/extensions/display_context";
import { BorderedSubScene } from "../../../phaser/extensions/sub_scene";

export class ProjectileRenderer extends GameStateObjectRenderer<ProjectileSummary, Phaser.GameObjects.Arc> {
    constructor(subScene: BorderedSubScene) {
        super({
            alwaysCreate: false,
            withCleanup: true
        }, new SubSceneDisplayContext(subScene), "projectile_renderer");
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