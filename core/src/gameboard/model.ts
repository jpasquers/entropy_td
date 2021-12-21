import { Coordinate, PixelCoordinate, getPxCenter } from "..";
import { getAllCoordinates } from "../common/utils";
import { Dim2D } from "./game_board";

export class OccupiesBoard {
    tlCoord: Coordinate;
    size: Dim2D;
    coords: Coordinate[];
    pxCenter: PixelCoordinate;

    constructor(tlCoord: Coordinate, size: Dim2D) {
        this.tlCoord = tlCoord;
        this.size = size;
        this.coords = getAllCoordinates(tlCoord, size);
        this.pxCenter = getPxCenter(tlCoord, size);
    }
}