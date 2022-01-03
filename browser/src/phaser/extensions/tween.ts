import { Tweens } from "phaser";

export class ObjectAnimator {
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public flash(targets: Phaser.GameObjects.GameObject[], originalColor: number) {
        this.scene.tweens.add({
            targets: targets,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            duration: 1600,
            delay: 0,
            props: {
                fill: {
                    getStart: () => originalColor,
                    getEnd: () => 0x0000000
                }
            }
        })
    }

    public blink(targets: Phaser.GameObjects.GameObject[]) {

        this.scene.tweens.add({
            targets: targets,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            duration: 1600,
            delay: 0,
            props: {
                alpha: {
                    getStart: () => 0.3,
                    getEnd: () => 1
                }
            }
        })
    }
}