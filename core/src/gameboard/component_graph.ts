import { Graph, alg } from "graphlib";
import { Coordinate } from "..";
import { coordinateKey, getSurroundingKeys, coordFromKey } from "./coordinate_map";

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