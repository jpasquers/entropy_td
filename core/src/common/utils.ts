import { IndexType, InlayHint } from "typescript";
import { ConfigType } from "../config";
import { TILE_SIZE_PX } from "../constants";
import { Coordinate, Dim2D, PixelCoordinate } from "../game_board";

export const getTileCenterPx = (coord: Coordinate): PixelCoordinate => {
    return getPxCenter(coord, {width: 1, height: 1});
}

export const getPxCenter = (tlCoord: Coordinate, dim: Dim2D): PixelCoordinate => {
    return {
        pxCol: tlCoord.col*TILE_SIZE_PX + (dim.width*TILE_SIZE_PX*0.5),
        pxRow: tlCoord.row*TILE_SIZE_PX + (dim.height*TILE_SIZE_PX*0.5)
    }
}

export const getCurrentTile = (pixelCoord: PixelCoordinate, dim: number): Coordinate => {
    return {
        row: Math.floor(pixelCoord.pxRow / dim),
        col: Math.floor(pixelCoord.pxCol / dim)
    }
}

export const randomSpotInArray = (size: number): number => {
    return Math.floor(Math.random() * size);
 }

export const coordsEqual = (a: Coordinate, b: Coordinate): boolean => {
    return a.col === b.col && a.row === b.row;
}

export const getAllCoordinates = (tlCoord: Coordinate, dim: Dim2D): Coordinate[] => {
    let coords: Coordinate[] = [];
    for (let row=tlCoord.row; row < tlCoord.row + dim.height; row++) {
        for (let col=tlCoord.col; col < tlCoord.col + dim.width; col++) {
            coords.push({row,col})
        }
    }
    return coords;
}

export const pythag = (a: number, b: number): number => {
   return Math.sqrt((a**2) + (b**2));
}

export const calculateDistance = (src: PixelCoordinate, target: PixelCoordinate): number => {
    let rowDistance = target.pxRow - src.pxRow;
    let colDistance = target.pxCol - src.pxCol;
    return pythag(rowDistance, colDistance);
}

export const isWithinDistance = (src: PixelCoordinate, target: PixelCoordinate, dist: number): boolean => {
    return calculateDistance(src,target) <= dist;
}

export const findNewPosition = (src: PixelCoordinate, target: PixelCoordinate, moveDistance: number): PixelCoordinate => {
    let totalPxSeparationRow = target.pxRow - src.pxRow;
    let totalPxSeparationCol = target.pxCol - src.pxCol;
    let totalSeparationDistance = calculateDistance(src,target);
    let pctDistanceToTravel = moveDistance / totalSeparationDistance;

    if (pctDistanceToTravel > 1) pctDistanceToTravel = 1;
    let rowChange = Math.floor(totalPxSeparationRow*pctDistanceToTravel);
    let colChange = Math.floor(totalPxSeparationCol*pctDistanceToTravel);
    return {
        pxCol: src.pxCol + colChange,
        pxRow: src.pxRow + rowChange
    }
}

export type ConfigWithOptionalMappedSubType<SrcType extends ConfigType,ReplaceFrom,ReplaceTo> =  {
    [K in keyof SrcType]: SrcType[K] extends ReplaceFrom 
        ? ReplaceTo | ReplaceFrom 
        : SrcType[K] extends ConfigType 
            ? ConfigWithOptionalMappedSubType<SrcType[K],ReplaceFrom,ReplaceTo> 
            : K;
}

export type ConfigWithStrictMappedSubType<SrcType extends ConfigType, ReplaceFrom,ReplaceTo> = {
    [K in keyof SrcType]: SrcType[K] extends ReplaceFrom 
        ? ReplaceTo 
        : SrcType[K] extends (ReplaceFrom | ReplaceTo) 
            ? ReplaceTo
            : SrcType[K] extends ConfigType 
                ? ConfigWithStrictMappedSubType<SrcType[K],ReplaceFrom,ReplaceTo> 
                : K;
}