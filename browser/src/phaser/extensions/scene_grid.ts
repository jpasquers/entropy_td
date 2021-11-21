import { PixelCoordinate } from "entropy-td-core";
import { SubScene } from "./sub_scene";

export interface SceneGrid<T extends SubScene> {
    getSections: ()=>T[];
}

export abstract class BasicSceneGrid<T extends SubScene> implements SceneGrid<T> {
    abstract getSections(): T[];

    public getBorderedSections(): T[] {
        return this.getSections()
            .filter((section):boolean => !!section.border && !!section.border.width)
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