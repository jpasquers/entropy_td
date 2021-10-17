import { Coordinate } from "../game_board";
import { aStarFinder } from "./astar_finder";
export interface PathFinder {
    search: PathSearchAlgorithm
} 

export type PathSearchAlgorithm = (grid: number[][], start: Coordinate, end: Coordinate) => Coordinate[];

export const getSearchAlgorithmInclusive = (): PathFinder => {
    return {
        search: aStarFinder
    }
}