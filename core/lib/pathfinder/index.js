import { aStarFinder } from "./astar_finder";
export const getSearchAlgorithmInclusive = () => {
    return {
        search: aStarFinder
    };
};
