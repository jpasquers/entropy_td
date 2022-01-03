import { Coordinate } from "..";

export const coordinateKeys = (...coords: Coordinate[]): string[] => {
    return coords.map((coord) => coordinateKey(coord));
}

export const coordinateKey = (coord: Coordinate): string => {
    return coord.row + "," + coord.col;
}

export const getSurroundingKeys = (inputKey: string): string[] => {
    let [row, col] = inputKey.split(",").map(val => parseInt(val));
    let up = {row: row-1, col: col};
    let down = {row: row+1, col: col};
    let left = {row: row, col: col-1};
    let right = {row: row, col: col+1};
    let options = [up,down,left,right]; // You don't have to worry about bounds because they won't be available.
    return options.map(coord => coordinateKey(coord));
}

export const coordFromKey = (coordKey: string): Coordinate => {
    let [row, col] = coordKey.split(",").map(val => parseInt(val));
    return {row,col};
}

export const getCoordinateMap = (coords: Coordinate[]): Record<string,Coordinate> => {
    return coords.reduce((map: Record<string, Coordinate>,coord: Coordinate) => {
        map[coordinateKey(coord)] = coord;
        return map;
    },{});
}