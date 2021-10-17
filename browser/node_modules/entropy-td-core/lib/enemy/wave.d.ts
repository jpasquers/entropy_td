import { ActiveCreep, Creep } from "./creep";
export declare class Wave {
    creeps: Creep[];
    activeCreeps: ActiveCreep[];
    config: WaveConfiguration;
    constructor(config: WaveConfiguration, creeps: Creep[]);
}
export interface WaveConfiguration {
    creepFrameSeparation: number;
    waveType: WaveType;
}
export declare enum WaveType {
    SimpleGround = 0
}
export declare const simpleGroundWave: () => Wave;
