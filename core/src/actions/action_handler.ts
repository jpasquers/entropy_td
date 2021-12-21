import { GameBoard, TowerType } from "..";
import { Coordinate } from "../gameboard/game_board";
import { PlayerGameState } from "../friendly/player";
import { Timeline } from "../timeline";

let GLOBAL_ID = 0;
export class ActionError extends Error {
    ts: Date;
    id: string;
    constructor(message: string) {
        super(message);
        this.ts = new Date();
        this.id = (++GLOBAL_ID).toString();
    }
}

export class ActionHandler {
    playerState: PlayerGameState;
    gameBoard: GameBoard;
    timeline: Timeline;
    
    constructor(playerState: PlayerGameState, gameBoard: GameBoard, timeline: Timeline) {
        this.playerState = playerState;
        this.gameBoard = gameBoard;
        this.timeline = timeline;
    }

    addTower(tlCoord: Coordinate, towerType: TowerType) {
        if (this.timeline.isWaveActive) {
            throw new ActionError("Cannot place towers during wave");
        }
        if (!this.playerState.canAfford(towerType.baseCost)) {
            throw new ActionError("Cannot afford tower. Stop being broke.")
        }
        if (!this.gameBoard.spaceForTowerAt(towerType, tlCoord)) {
            throw new ActionError("Cannot place towers on blocked sections");
        }
        try {
            this.gameBoard.addTowerWithRollback(tlCoord, towerType);
            this.playerState.makePurchase(towerType.baseCost);
        }
        catch(e) {
            throw new ActionError("Don't block the path");
        }
    }
}