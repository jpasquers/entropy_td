import Phaser, { CANVAS } from "phaser";
import { GameOrchestrator } from "entropy-td-core";
import { ActiveGameWorldScene } from "./scenes/active_game/world";
import { getEffectiveGameWidth, getEffectiveGameHeight } from "./scenes/scene_grid";
import { BG_COLOR } from "./display_configs";
import { ActiveGameSceneComposite } from "./scenes/active_game";


class PhaserGameDelegate {
    gameView: Phaser.Game;
    gameController: GameOrchestrator
    constructor(gameController: GameOrchestrator) {
        let activeGame = new ActiveGameSceneComposite(gameController);
        this.gameView = new Phaser.Game({
            input: true,
            scene: activeGame.getAll(),
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