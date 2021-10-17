import { Coordinate } from "../game_board";
export interface PathFinder {
    search: PathSearchAlgorithm;
}
export declare type PathSearchAlgorithm = (grid: number[][], start: Coordinate, end: Coordinate) => Coordinate[];
export declare const getSearchAlgorithmInclusive: () => PathFinder;
