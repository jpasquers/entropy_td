import { WaveExecutor } from "../enemy/wave_executor";
import { Projectile, ProjectileSummary } from "./projectile";
export declare class ProjectileTracker {
    projectiles: Projectile[];
    waveExecutor: WaveExecutor;
    constructor(waveExecutor: WaveExecutor);
    addProjectile(projectile: Projectile): void;
    summaries(): ProjectileSummary[];
    moveProjectiles(): void;
}
