import { isWithinDistance } from "../common/utils";
import { WaveExecutor } from "../enemy/wave_executor";
import { Projectile, ProjectileSummary } from "./projectile";


export class ProjectileTracker {

    projectiles: Projectile[];

    waveExecutor: WaveExecutor;

    constructor(waveExecutor: WaveExecutor) {
        this.waveExecutor = waveExecutor;
        this.projectiles = [];
    }

    addProjectile(projectile: Projectile) {
        this.projectiles.push(projectile);
    }

    summaries(): ProjectileSummary[] {
        return this.projectiles.map(projectile => projectile.getSummary());
    }

    moveProjectiles() {
        this.projectiles.forEach((projectile,idx) => {
            projectile.moveFrame();
            //Simple value for now.
            if (isWithinDistance(projectile.pxPos, projectile.targetCreep.pxPos, 5)) {
                this.projectiles.splice(idx,1);
                //TODO real damage.
                this.waveExecutor.hurtCreep(projectile.targetCreep.id, projectile.srcTower.type.baseDamage);
            }
        });
    }
}