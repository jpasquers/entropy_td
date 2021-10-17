import { GameBoard } from "..";
import { Coordinate } from "../game_board";
import { PlayerState } from "../friendly/player";
import { Timeline } from "../timeline";
import { TowerType } from "../friendly/tower";

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
    playerState: PlayerState;
    gameBoard: GameBoard;
    timeline: Timeline;
    
    constructor(playerState: PlayerState, gameBoard: GameBoard, timeline: Timeline) {
        this.playerState = playerState;
        this.gameBoard = gameBoard;
        this.timeline = timeline;
    }

    addTower(pos: Coordinate, towerType: TowerType) {
        if (this.timeline.isWaveActive) {
            throw new ActionError("Cannot place towers during wave");
        }
        if (!this.playerState.canAfford(towerType.baseCost)) {
            throw new ActionError("Cannot afford tower. Stop being broke.")
        }
        try {
            this.gameBoard.addTowerWithRollback(pos, towerType);
            this.playerState.makePurchase(towerType.baseCost);
        }
        catch(e) {
            throw new ActionError("Don't block the path");
        }
    }
}