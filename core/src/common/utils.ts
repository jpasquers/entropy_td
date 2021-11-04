import { IndexType, InlayHint } from "typescript";
import { ConfigType } from "../config";
import { Coordinate, PixelCoordinate } from "../game_board";

export const getTileCenterPx = (coord: Coordinate, dim: number): PixelCoordinate => {
    return {
        pxCol: coord.col*dim + dim*0.5,
        pxRow: coord.row*dim + dim*0.5
    }
}

export const getCurrentTile = (pixelCoord: PixelCoordinate, dim: number): Coordinate => {
    return {
        row: Math.floor(pixelCoord.pxRow / dim),
        col: Math.floor(pixelCoord.pxCol / dim)
    }
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