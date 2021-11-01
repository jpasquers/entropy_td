import { PixelCoordinate } from "entropy-td-core";


//I am sure there are libraries for this. But personal project, good experience. :)
/**
 * Angle is calculated from pt1 12 o'clock moving clockwise.
 * @param pt1 
 * @param pt2 
 */
export const calculateAngleRad = (pt1: PixelCoordinate, pt2: PixelCoordinate): number => {
    //pt2 to the left
    if (pt1.pxCol > pt2.pxCol) {
        //pt2 above
        if (pt1.pxRow > pt2.pxRow) {
            return topLeftQuad(pt1,pt2);
        }
        //pt2 below
        else {
            return bottomLeftQuad(pt1,pt2);
        }
    }
    //pt2 to the right
    else {
        //pt2 above
        if (pt1.pxRow > pt2.pxRow) {
            return topRightQuad(pt1,pt2);
        }
        //pt2 below.
        else {
            return bottomRightQuad(pt1,pt2);
        }
    }
}

const topRightQuad = (pt1: PixelCoordinate, pt2: PixelCoordinate): number => {
    return Math.tanh(Math.abs(pt2.pxCol-pt1.pxCol) / Math.abs(pt1.pxRow - pt2.pxRow));
}

const topLeftQuad = (pt1: PixelCoordinate, pt2: PixelCoordinate): number => {
    return (Math.PI * 2) - Math.tanh(Math.abs(pt1.pxCol-pt2.pxCol) / Math.abs(pt1.pxRow - pt2.pxRow));
}

const bottomLeftQuad = (pt1: PixelCoordinate, pt2: PixelCoordinate): number => {
    return (Math.PI) + Math.tanh(Math.abs(pt1.pxCol-pt2.pxCol) / Math.abs(pt2.pxRow - pt1.pxRow));
}

const bottomRightQuad = (pt1: PixelCoordinate, pt2: PixelCoordinate): number => {
    return (Math.PI) - Math.tanh(Math.abs(pt2.pxCol-pt1.pxCol) / Math.abs(pt2.pxRow - pt1.pxRow));
}