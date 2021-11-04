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
    [K in keyof SrcType as string]: SrcType[K] extends ReplaceFrom ? ReplaceTo | ReplaceFrom : 
        SrcType[K] extends ConfigType ? ConfigWithOptionalMappedSubType<SrcType[K],ReplaceFrom,ReplaceTo> : K;
}

export type ConfigWithStrictMappedSubType<SrcType extends ConfigType, ReplaceFrom,ReplaceTo> = {
    [K in keyof SrcType as string]: SrcType[K] extends ReplaceFrom ? ReplaceTo : 
        SrcType[K] extends ConfigType ? ConfigWithOptionalMappedSubType<SrcType[K],ReplaceFrom,ReplaceTo> : K;
}


export interface Test{
    x: string;
    y:string;
}

export type TestMap<T> = {
    [K in keyof T]: number;
}

const sample: TestMap<Test> = {
    x: 0,
    y: 0
}

/**
 * Recurses through fields, and every time it finds a field matching the isLeaf function, 
 * Calls the map function and terminates for that branch.
 * 
 * 
 * 
 * In our example Outbound = InstanceGame, 
 * InLeafType = RandomizableRange | number;
 * OutLeafType = number;
 * 
 * inObj = Global = InstanceGame with number mapped to number or RandomizableRange
 * Outbound = InstanceGame = Global with number | RandomizableRange mapped strictly to number;
 */
export const unmapLeafType = <InLeafType, OutLeafType, 
    SrcType extends ConfigWithOptionalMappedSubType<
        ConfigWithStrictMappedSubType<SrcType,InLeafType | OutLeafType,InLeafType>,
        OutLeafType,
        InLeafType | OutLeafType
        >
    > (
    inObj: SrcType, 
    leafMap: (field: InLeafType) => OutLeafType,
    isTargetLeafType: (field: unknown)=>field is InLeafType
): ConfigWithStrictMappedSubType<SrcType,InLeafType | OutLeafType,InLeafType> => {
    let out: ConfigWithStrictMappedSubType<SrcType,InLeafType | OutLeafType,InLeafType> = {} as ConfigWithStrictMappedSubType<SrcType,InLeafType | OutLeafType,InLeafType>;
    // Object.entries(inObj).forEach(([key,value], i) => {
    //     if (isTargetLeafType(value)) {
    //         out[key] = leafMap(value);
    //     }
    //     else if (typeof value === 'object') {
    //         out[key] = unmapLeafType<InLeafType,OutLeafType,Outbound>(value,leafMap,isTargetLeafType);
    //     }
    //     else {
    //         out[key] = value;
    //     }
    // });
    return out;
}