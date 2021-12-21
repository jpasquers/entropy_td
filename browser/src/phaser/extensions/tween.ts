import { Tweens } from "phaser";

export class TweenDelegate {
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public blink(targets: Phaser.GameObjects.GameObject[]) {

        console.log(targets);
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