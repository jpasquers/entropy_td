import { Coordinate, PixelCoordinate } from "../game_board";
export declare const getTileCenterPx: (coord: Coordinate, dim: number) => PixelCoordinate;
export declare const getCurrentTile: (pixelCoord: PixelCoordinate, dim: number) => Coordinate;
export declare const pythag: (a: number, b: number) => number;
export declare const calculateDistance: (src: PixelCoordinate, target: PixelCoordinate) => number;
export declare const isWithinDistance: (src: PixelCoordinate, target: PixelCoordinate, dist: number) => boolean;
export declare const findNewPosition: (src: PixelCoordinate, target: PixelCoordinate, moveDistance: number) => PixelCoordinate;
