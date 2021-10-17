import { RenderWithOffset, BorderedSceneSubSection } from ".";

let timer: Phaser.GameObjects.Text;
let moneyDisplay: Phaser.GameObjects.Text;

export const renderTimer: RenderWithOffset<number> = (sceneSection: BorderedSceneSubSection, time: number) => {
    let dispTime = time >= 0 ? time : 0;
    if (!timer) {
        timer = sceneSection.scene.add.text(sceneSection.internalOffset.pxCol + 20, sceneSection.internalOffset.pxRow + 20, `Next Wave: ${dispTime}`, {
            fontSize: "35px"
        });
    }
    else {
        timer.setText(`Next Wave: ${dispTime}`);
    }
}

export const renderMoney: RenderWithOffset<number> = (sceneSection: BorderedSceneSubSection, money: number) => {
    if (!moneyDisplay) {
        moneyDisplay = sceneSection.scene.add.text(sceneSection.internalOffset.pxCol + 400, sceneSection.internalOffset.pxRow + 20, "", {
            fontSize: "35px"
        });
    }
    moneyDisplay.setText(`Money: $${money}`);
}