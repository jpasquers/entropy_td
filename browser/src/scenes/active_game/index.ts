import { ActionError, Coordinate, GameOrchestrator, LiveTower, TowerType } from "entropy-td-core";
import { GameStateSceneBridge } from "./gamestate_publisher";
import { ActiveGameHudScene } from "./hud";
import { ActiveGameWorldScene } from "./world";

export interface ActiveGameEventListener {
    preSelectTowerForPlacement(towerType: TowerType): void;
    placeTowerAction(towerType: TowerType, coord: Coordinate): void;
    sellTowerAction(tower: LiveTower): void;
    selectTower(tower: LiveTower): void;
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
    selectTower(tower: LiveTower): void {
        this.activeGameHUD.selectTower(tower);
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

    sellTowerAction(tower: LiveTower): void {
        this.attemptAction(() => {
            this.gameController.actor().sellTower(tower);
            this.activeGameHUD.resetToGlobal();
        })
    }

    placeTowerAction(towerType: TowerType, coord: Coordinate): void {
        if (this.gameController.gameBoard.spaceForTowerAt(towerType, coord) && towerType) {
            this.attemptAction(() => {
                this.gameController.actor().addTower(coord, towerType);
                this.activeGameWorld.towerPlaced();
                this.activeGameHUD.towerPlaced();
            });
        }
    }

    

    preSelectTowerForPlacement(towerType: TowerType): void {
        this.activeGameWorld.towerPreSelect(towerType);
        this.activeGameHUD.towerPreSelect(towerType);
    }

    getAll(): Phaser.Scene[] {
        return [this.gameStateBridge, this.activeGameWorld,  this.activeGameHUD];
    }
}
