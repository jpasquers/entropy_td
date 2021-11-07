import { PixelCoordinate } from "entropy-td-core";
import { BorderedSubScene, isBordered, SubScene } from "./sub_scene";

export interface SceneGrid {
    getSections: ()=>(SubScene | BorderedSubScene)[];
}

export abstract class BasicSceneGrid implements SceneGrid {
    abstract getSections(): (SubScene | BorderedSubScene)[];

    public getBorderedSections(): BorderedSubScene[] {
        return this.getSections()
            .filter((section): section is BorderedSubScene => isBordered(section));
    }
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