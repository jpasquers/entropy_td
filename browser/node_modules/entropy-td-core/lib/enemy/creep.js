let GLOBAL_ID = 1;
export var CreepType;
(function (CreepType) {
    CreepType[CreepType["SimpleGround"] = 0] = "SimpleGround";
})(CreepType || (CreepType = {}));
export const simpleGroundCreep = () => {
    return {
        type: CreepType.SimpleGround,
        maxHealth: 100,
        velocityPxPerFrame: 6,
        id: (GLOBAL_ID++).toString()
    };
};
