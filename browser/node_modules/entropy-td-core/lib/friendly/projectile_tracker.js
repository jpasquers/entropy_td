import { isWithinDistance } from "../common/utils";
export class ProjectileTracker {
    projectiles;
    waveExecutor;
    constructor(waveExecutor) {
        this.waveExecutor = waveExecutor;
        this.projectiles = [];
    }
    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }
    summaries() {
        return this.projectiles.map(projectile => projectile.getSummary());
    }
    moveProjectiles() {
        this.projectiles.forEach((projectile, idx) => {
            projectile.moveFrame();
            //Simple value for now.
            if (isWithinDistance(projectile.pxPos, projectile.targetCreep.pxPos, 5)) {
                this.projectiles.splice(idx, 1);
                //TODO real damage.
                this.waveExecutor.hurtCreep(projectile.targetCreep.id, projectile.srcTower.type.baseDamage);
            }
        });
    }
}
