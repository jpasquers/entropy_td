import { PixelCoordinate } from "entropy-td-core/lib/game_board";
import { BorderedSubScene } from "./sub_scene";

export interface SceneGrid {
    getSections: ()=>BorderedSubScene[];
}

export const GRID_BORDER_THICKNESS = 8;

export const toExternalDim = (internal: number): number => {
    return internal + 2*GRID_BORDER_THICKNESS;
}

export const toExternalOffset = (internal: PixelCoordinate): PixelCoordinate => {
    return {
        pxCol: internal.pxCol - GRID_BORDER_THICKNESS,
        pxRow: internal.pxRow - GRID_BORDER_THICKNESS
    }
}