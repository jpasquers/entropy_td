import { findNewPosition } from "../common/utils";
let GLOBAL_ID = 0;
export class Projectile {
    srcTower;
    targetCreep;
    pxPos;
    config;
    id;
    constructor(tower, activeCreep, config) {
        this.config = config;
        this.srcTower = tower;
        this.targetCreep = activeCreep;
        this.pxPos = this.srcTower.pxCenter;
        this.id = (GLOBAL_ID++).toString();
    }
    moveFrame() {
        // TODO: not suk
        this.pxPos = findNewPosition(this.pxPos, this.targetCreep.pxPos, this.config.speedPxPerFrame);
    }
    getSummary() {
        return {
            id: this.id,
            pxPos: this.pxPos
        };
    }
}
export var ProjectileType;
(function (ProjectileType) {
    ProjectileType["SmallCircle"] = "small_circle";
})(ProjectileType || (ProjectileType = {}));
export const SimpleProjectile = {
    speedPxPerFrame: 15
};
