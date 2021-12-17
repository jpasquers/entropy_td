import { Graph, alg } from "graphlib";
import { Coordinate } from "..";
import { Dim2D, Rock } from "./game_board";

const coordinateKey = (coord: Coordinate): string => {
    return coord.row + "," + coord.col;
}

const getSurroundingKeys = (inputKey: string): string[] => {
    let [row, col] = inputKey.split(",").map(val => parseInt(val));
    let up = {row: row-1, col: col};
    let down = {row: row+1, col: col};
    let left = {row: row, col: col-1};
    let right = {row: row, col: col+1};
    let options = [up,down,left,right]; // You don't have to worry about bounds because they won't be available.
    return options.map(coord => coordinateKey(coord));
}

const coordFromKey = (coordKey: string): Coordinate => {
    let [row, col] = coordKey.split(",").map(val => parseInt(val));
    return {row,col};
}

export const buildConnectedGraph = (availableCoordinates: Coordinate[]): Graph => {
    let graph = new Graph({
        directed: false
    });
    availableCoordinates.forEach((coord) => {
        graph.setNode(coordinateKey(coord), coord);
    })
    graph.nodes().forEach(node => {
        getSurroundingKeys(node).forEach(keyOption => {
            if (graph.hasNode(keyOption) && !graph.hasEdge(node,keyOption)) {
                graph.setEdge(node, keyOption);
            }
        })
    })
    return graph;
}

export const getLargestConnectedGrid = (availableCoordinates: Coordinate[]): Coordinate[] => {
    let graph = buildConnectedGraph(availableCoordinates);
    let connectedComponents = alg.components(graph);
    let maxLength = Math.max(...connectedComponents.map(comp => comp.length));
    return connectedComponents.find(comp => comp.length === maxLength)!.map(key => coordFromKey(key));
}