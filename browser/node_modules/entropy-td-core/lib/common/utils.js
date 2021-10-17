export const getTileCenterPx = (coord, dim) => {
    return {
        pxCol: coord.col * dim + dim * 0.5,
        pxRow: coord.row * dim + dim * 0.5
    };
};
export const getCurrentTile = (pixelCoord, dim) => {
    return {
        row: Math.floor(pixelCoord.pxRow / dim),
        col: Math.floor(pixelCoord.pxCol / dim)
    };
};
export const pythag = (a, b) => {
    return Math.sqrt((a ** 2) + (b ** 2));
};
export const calculateDistance = (src, target) => {
    let rowDistance = target.pxRow - src.pxRow;
    let colDistance = target.pxCol - src.pxCol;
    return pythag(rowDistance, colDistance);
};
export const isWithinDistance = (src, target, dist) => {
    return calculateDistance(src, target) <= dist;
};
export const findNewPosition = (src, target, moveDistance) => {
    let totalPxSeparationRow = target.pxRow - src.pxRow;
    let totalPxSeparationCol = target.pxCol - src.pxCol;
    let totalSeparationDistance = calculateDistance(src, target);
    let pctDistanceToTravel = moveDistance / totalSeparationDistance;
    if (pctDistanceToTravel > 1)
        pctDistanceToTravel = 1;
    let rowChange = Math.floor(totalPxSeparationRow * pctDistanceToTravel);
    let colChange = Math.floor(totalPxSeparationCol * pctDistanceToTravel);
    return {
        pxCol: src.pxCol + colChange,
        pxRow: src.pxRow + rowChange
    };
};
