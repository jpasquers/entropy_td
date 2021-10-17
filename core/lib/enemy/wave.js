import { simpleGroundCreep } from "./creep";
export class Wave {
    creeps;
    activeCreeps;
    config;
    constructor(config, creeps) {
        this.creeps = creeps;
        this.activeCreeps = [];
        this.config = config;
    }
}
export var WaveType;
(function (WaveType) {
    WaveType[WaveType["SimpleGround"] = 0] = "SimpleGround";
})(WaveType || (WaveType = {}));
export const simpleGroundWave = () => {
    return new Wave({
        creepFrameSeparation: 30,
        waveType: WaveType.SimpleGround
    }, [simpleGroundCreep(), simpleGroundCreep(), simpleGroundCreep(), simpleGroundCreep()]);
};
