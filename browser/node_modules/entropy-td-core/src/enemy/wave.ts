import { ActiveCreep, Creep, CreepType, simpleGroundCreep } from "./creep";

export class Wave {
    creeps: Creep[];
    activeCreeps: ActiveCreep[];
    config: WaveConfiguration;

    constructor(config: WaveConfiguration, creeps: Creep[]) {
        this.creeps = creeps;
        this.activeCreeps = [];
        this.config = config;
    }
}


export interface WaveConfiguration {
    creepFrameSeparation: number;
    waveType: WaveType;
}

export enum WaveType {
    SimpleGround
}

export const simpleGroundWave = (): Wave => {
    return new Wave({
        creepFrameSeparation: 30,
        waveType: WaveType.SimpleGround
    }, [simpleGroundCreep(),simpleGroundCreep(),simpleGroundCreep(),simpleGroundCreep()])
}