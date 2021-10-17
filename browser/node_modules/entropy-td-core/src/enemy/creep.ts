import { PixelCoordinate } from "../game_board";

let GLOBAL_ID = 1;

export interface Creep {
    velocityPxPerFrame: number;
    maxHealth: number;
    type: CreepType;
    id: string;
}

export enum CreepType {
    SimpleGround
}

export interface ActiveCreep extends Creep {
    checkpointsCrossed: number;
    pxPos: PixelCoordinate;
    health: number;
}

export const simpleGroundCreep = (): Creep => {
    return {
        type: CreepType.SimpleGround,
        maxHealth: 100,
        velocityPxPerFrame: 6,
        id: (GLOBAL_ID++).toString()
    }
}