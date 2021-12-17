import { Coordinate } from "../gameboard/game_board";
import { PathSearchAlgorithm } from ".";
import { AStarFinder } from "astar-typescript";
import { IPoint } from "astar-typescript/dist/interfaces/astar.interfaces";

const coordToIPoint = (coord: Coordinate): IPoint => {
    return {
        x: coord.col,
        y: coord.row
    }
}

const xyToCoord = (xy: number[]): Coordinate => {
    return {
        row: xy[1],
        col: xy[0]
    }
}

export const aStarFinder: PathSearchAlgorithm = (grid: number[][], start: Coordinate, end: Coordinate): Coordinate[] => {
    return new AStarFinder({
        grid: {
            matrix: grid
        },
        diagonalAllowed: false
    }).findPath(coordToIPoint(start), coordToIPoint(end))
    .map(val => xyToCoord(val));
}