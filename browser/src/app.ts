import Phaser, { CANVAS } from "phaser";
import { GameOrchestrator } from "entropy-td-core";
import { ActiveGameScene } from "./scenes/active_game";
import { getEffectiveGameWidth, getEffectiveGameHeight } from "./scenes/scene_grid";
import { BG_COLOR } from "./display_configs";
import { HudScene } from "./scenes/hud";


class PhaserGameDelegate {
    gameView: Phaser.Game;
    gameController: GameOrchestrator
    constructor(gameController: GameOrchestrator) {
        this.gameView = new Phaser.Game({
            input: true,
            scene: [new ActiveGameScene(gameController),new HudScene(gameController)],
            width: getEffectiveGameWidth(gameController.config),
            height: getEffectiveGameHeight(gameController.config),
            type: CANVAS,
            backgroundColor: BG_COLOR,
            roundPixels: true,
            
        });
        this.gameController = gameController;
    }

}


let gameDelegate = new PhaserGameDelegate(GameOrchestrator.newGame());