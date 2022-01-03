import { Coordinate, PixelCoordinate, getPxCenter } from "..";
import { getFullObjectSpace } from "../common/utils";
import { Dim2D } from "./game_board";

export class OccupiesBoard {
    tlCoord: Coordinate;
    size: Dim2D;
    coords: Coordinate[];
    pxCenter: PixelCoordinate;

    constructor(tlCoord: Coordinate, size: Dim2D) {
        this.tlCoord = tlCoord;
        this.size = size;
        this.coords = getFullObjectSpace(tlCoord, size);
        this.pxCenter = getPxCenter(tlCoord, size);
    }

    public containsCoord(coord: Coordinate): boolean {
        return this.coords.includes(coord);
    }
}