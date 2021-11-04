import Phaser from "phaser";
import { GameOrchestrator } from "entropy-td-core";
import { ActiveGameScene } from "./scenes/active_game";
import { getEffectiveGameWidth, getEffectiveGameHeight } from "./scenes/scene_grid";


class PhaserGameDelegate {
    gameView: Phaser.Game;
    gameController: GameOrchestrator
    constructor(gameController: GameOrchestrator) {
        this.gameView = new Phaser.Game({
            input: true,
            scene: new ActiveGameScene(gameController),
            scale: {
                width: getEffectiveGameWidth(gameController.config),
                height: getEffectiveGameHeight(gameController.config),
                autoCenter: Phaser.Scale.CENTER_BOTH,
                mode: Phaser.Scale.FIT,
            },
            backgroundColor: 0x282828
        });
        this.gameController = gameController;
    }

}


let gameDelegate = new PhaserGameDelegate(GameOrchestrator.newGame());