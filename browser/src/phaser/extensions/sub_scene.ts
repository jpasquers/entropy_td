import { PixelCoordinate } from "entropy-td-core";
import { CameraAdapter } from "./camera";


export interface SubScene {
    id: string;
    scene: Phaser.Scene;
    externalWidth: number;
    externalHeight: number;
    externalOffset: PixelCoordinate;
    layer: number;
    filled?: number;
    border?: Border;
}

export const isCameraFixed = (subScene: SubScene):subScene is CameraFixedSubScene => {
    return "cameraOffset" in subScene;
}

export const isWorldFixed = (subScene: SubScene):subScene is WorldFixedSubScene => {
    return "worldOffset" in subScene;
}

export interface CameraFixedSubScene extends SubScene{
    boundToCamera: CameraAdapter;
    cameraOffset: PixelCoordinate;
}

export interface WorldFixedSubScene extends SubScene {
    worldOffset: PixelCoordinate;
}


export interface Border {
    color: number;
    rounding?: number;
    width: number;
}

export const getInternalWidth = (subScene: SubScene) => {
    if (!subScene.border) return subScene.externalWidth;
    else return subScene.externalWidth - (subScene.border.width*2);
}

export const getInternalHeight = (subScene: SubScene) => {
    if (!subScene.border) return subScene.externalHeight;
    else return subScene.externalHeight - (subScene.border.width*2);
}