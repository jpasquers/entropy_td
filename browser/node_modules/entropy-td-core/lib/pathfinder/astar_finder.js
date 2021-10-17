import { AStarFinder } from "astar-typescript";
const coordToIPoint = (coord) => {
    return {
        x: coord.col,
        y: coord.row
    };
};
const xyToCoord = (xy) => {
    return {
        row: xy[1],
        col: xy[0]
    };
};
export const aStarFinder = (grid, start, end) => {
    return new AStarFinder({
        grid: {
            matrix: grid
        },
        diagonalAllowed: false
    }).findPath(coordToIPoint(start), coordToIPoint(end))
        .map(val => xyToCoord(val));
};
