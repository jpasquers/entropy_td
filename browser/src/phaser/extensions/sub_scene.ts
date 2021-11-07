import { PixelCoordinate } from "entropy-td-core";


export interface SubScene {
    id: string;
    scene: Phaser.Scene;
    internalOffset: PixelCoordinate;
    internalWidth: number;
    internalHeight: number;
    fixed?: boolean;
    filled?: number;
}


export interface Border {
    color: number;
    rounding?: number;
    width: number | BorderWidthDetail;
}

export interface BorderWidthDetail {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

export interface BorderedSubScene extends SubScene {
    border: Border;
}

export const isBordered = (val: SubScene | BorderedSubScene):val is BorderedSubScene => {
    return "border" in val;
}