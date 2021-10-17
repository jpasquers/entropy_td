import { GameBoard } from "..";
import { Coordinate } from "../game_board";
import { PlayerState } from "../friendly/player";
import { Timeline } from "../timeline";
import { TowerType } from "../friendly/tower";
export declare class ActionError extends Error {
    ts: Date;
    id: string;
    constructor(message: string);
}
export declare class ActionHandler {
    playerState: PlayerState;
    gameBoard: GameBoard;
    timeline: Timeline;
    constructor(playerState: PlayerState, gameBoard: GameBoard, timeline: Timeline);
    addTower(pos: Coordinate, towerType: TowerType): void;
}
