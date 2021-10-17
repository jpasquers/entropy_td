import { GameOrchestrator } from "entropy-td-core";
import { ActionError, ActionHandler } from "entropy-td-core/lib/actions/action_handler";
import { Tower, TowerType } from "entropy-td-core/lib/friendly/tower";
import { Coordinate, GameBoard, PixelCoordinate } from "entropy-td-core/lib/game_board";
import { TowerSilhoutteRenderer } from "../mouse_tracker";
import { TerrainRenderer } from "../renderers/board";
import { ErrorRenderer } from "../renderers/error";
import { MouseMovementTracker } from "./analog_input_mapper";

export class PlayerEventActionMapper implements PlayerEventHandler {
    actionHandler: ActionHandler;
    gameBoard: GameBoard;
    terrainRenderer: TerrainRenderer;
    mouseMovementTracker: MouseMovementTracker;
    gameCoordinator: GameOrchestrator;
    selectedTowerType?: TowerType;
    errorRenderer: ErrorRenderer;
    towerSilhoutteRenderer?: TowerSilhoutteRenderer;

    constructor(gameCoordinator: GameOrchestrator,
        terrainRenderer: TerrainRenderer,
        mouseMovementTracker: MouseMovementTracker,
        errorRenderer: ErrorRenderer) {
        this.gameCoordinator = gameCoordinator;
        this.actionHandler = gameCoordinator.actor();
        this.gameBoard = gameCoordinator.getBoard();
        this.terrainRenderer = terrainRenderer;
        this.mouseMovementTracker = mouseMovementTracker;
        this.errorRenderer = errorRenderer;
    }


    clickTerrain(coord: Coordinate): void {
        try {
            if (this.gameBoard.isOpen(coord) && this.selectedTowerType) {
                this.actionHandler.addTower(coord, this.selectedTowerType);
                this.mouseMovementTracker.removeListener((listener) => listener instanceof TowerSilhoutteRenderer);
                this.towerSilhoutteRenderer?.destroy();
                this.towerSilhoutteRenderer = undefined;
            }
        }
        catch(e) {
            if (e instanceof ActionError) {
                this.errorRenderer.renderError(e);
            }
        }
    }



    selectTowerTypeForHover(towerType: TowerType): void {
        this.towerSilhoutteRenderer = new TowerSilhoutteRenderer(towerType, this.terrainRenderer, this.gameCoordinator);
        this.mouseMovementTracker.addMouseMovementListener(this.towerSilhoutteRenderer);
        this.selectedTowerType = towerType;
    }
}

export interface PlayerEventHandler {
    clickTerrain: (coord: Coordinate) => void;
    selectTowerTypeForHover:(towerType: TowerType) => void;
}