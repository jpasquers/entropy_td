import { getTileCenterPx } from "../common/utils";
import { SimpleProjectile } from "./projectile";
let GLOBAL_ID = 0;
export const fromTowerType = (pos, tileDim, towerType) => {
    return {
        type: {
            name: "simple_1",
            enabled: true,
            hotkey: "a",
            baseCost: 10,
            baseDamage: 25,
            baseFramesPerAttk: 25,
            baseRangePx: 150,
            projectileConfig: SimpleProjectile
        },
        framesReloading: 0,
        id: (GLOBAL_ID++).toString(),
        pos: pos,
        pxCenter: getTileCenterPx(pos, tileDim)
    };
};
