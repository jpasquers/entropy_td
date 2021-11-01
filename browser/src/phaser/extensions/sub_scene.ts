import { PixelCoordinate } from "entropy-td-core";

export interface BorderedSubScene {
    id: string;
    scene: Phaser.Scene;
    internalOffset: PixelCoordinate;
    internalWidth: number;
    internalHeight: number;
}