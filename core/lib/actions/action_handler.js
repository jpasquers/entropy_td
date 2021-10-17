let GLOBAL_ID = 0;
export class ActionError extends Error {
    ts;
    id;
    constructor(message) {
        super(message);
        this.ts = new Date();
        this.id = (++GLOBAL_ID).toString();
    }
}
export class ActionHandler {
    playerState;
    gameBoard;
    timeline;
    constructor(playerState, gameBoard, timeline) {
        this.playerState = playerState;
        this.gameBoard = gameBoard;
        this.timeline = timeline;
    }
    addTower(pos, towerType) {
        if (this.timeline.isWaveActive) {
            throw new ActionError("Cannot place towers during wave");
        }
        if (!this.playerState.canAfford(towerType.baseCost)) {
            throw new ActionError("Cannot afford tower. Stop being broke.");
        }
        try {
            this.gameBoard.addTowerWithRollback(pos, towerType);
            this.playerState.makePurchase(towerType.baseCost);
        }
        catch (e) {
            throw new ActionError("Don't block the path");
        }
    }
}
