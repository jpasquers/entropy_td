import { PixelCoordinate } from "../game_board";
export interface Creep {
    velocityPxPerFrame: number;
    maxHealth: number;
    type: CreepType;
    id: string;
}
export declare enum CreepType {
    SimpleGround = 0
}
export interface ActiveCreep extends Creep {
    checkpointsCrossed: number;
    pxPos: PixelCoordinate;
    health: number;
}
export declare const simpleGroundCreep: () => Creep;
