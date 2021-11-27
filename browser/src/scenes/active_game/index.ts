import { ActionError, Coordinate, GameOrchestrator, TowerType } from "entropy-td-core";
import { GameStateSceneBridge } from "./gamestate_publisher";
import { ActiveGameHudScene } from "./hud";
import { ActiveGameWorldScene } from "./world";

export interface ActiveGameEventListener {
    preSelectTower(towerType: TowerType): void;
    attemptToPlaceTower(towerType: TowerType, coord: Coordinate): void;
}

export class ActiveGameSceneComposite implements ActiveGameEventListener{
    gameController: GameOrchestrator;
    activeGameWorld: ActiveGameWorldScene;
    activeGameHUD: ActiveGameHudScene;
    gameStateBridge: GameStateSceneBridge;

    constructor(gameController: GameOrchestrator) {
        this.gameController = gameController;
        this.gameStateBridge = new GameStateSceneBridge(gameController);
        this.activeGameWorld = new ActiveGameWorldScene(gameController, this.gameStateBridge.getPublisher(), this),
        this.activeGameHUD =  new ActiveGameHudScene(gameController, this.gameStateBridge.getPublisher(), this)
    }

    attemptAction(action: ()=>void) {
        try {
            action();
        }
        catch(e) {
            if (e instanceof ActionError) {
                this.activeGameHUD.handleActionError(e);
            }
        }
    }

    attemptToPlaceTower(towerType: TowerType, coord: Coordinate): void {
        if (this.gameController.gameBoard.isOpen(coord) && towerType) {
            this.attemptAction(() => {
                this.gameController.actor().addTower(coord, towerType);
                this.activeGameWorld.towerPlaced();
                this.activeGameHUD.towerPlaced();
            });
        }
    }

    preSelectTower(towerType: TowerType): void {
        this.activeGameWorld.towerPreSelect(towerType);
        this.activeGameHUD.towerPreSelect(towerType);
    }

    getAll(): Phaser.Scene[] {
        return [this.gameStateBridge, this.activeGameWorld,  this.activeGameHUD];
    }
}
