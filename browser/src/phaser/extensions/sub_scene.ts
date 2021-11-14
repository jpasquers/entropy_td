import { PixelCoordinate } from "entropy-td-core";
import { CameraAdapter } from "./camera";


export interface SubScene {
    id: string;
    scene: Phaser.Scene;
    internalOffset: PixelCoordinate;
    internalWidth: number;
    internalHeight: number;
    filled?: number;
}

export interface CameraBoundSubScene extends SubScene{
    boundTo: CameraAdapter;
}

export type WorldBoundSubScene = SubScene;


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