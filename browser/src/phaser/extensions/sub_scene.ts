import { PixelCoordinate } from "entropy-td-core/lib/game_board";

export interface BorderedSubScene {
    id: string;
    scene: Phaser.Scene;
    internalOffset: PixelCoordinate;
    internalWidth: number;
    internalHeight: number;
}