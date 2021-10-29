import { TowerType } from "entropy-td-core/lib/friendly/tower";
import { ActiveGameScene } from "..";
import { State, StateMap } from "../../../common/state";
import { AddTowerActor } from "../actors/add_tower_actor";
import { CommandCard, TowerListCommandCard } from "../command_card";
import { TowerSilhoutteRenderer } from "../renderers/tower_silhoutte";

export const getActiveGameStartingState = (scene: ActiveGameScene) => {
    return new TowerSelection(scene);
}

export abstract class ActiveGameState<Props> extends State<ActiveGameScene, Props> {
    
}

export class TowerSelection extends ActiveGameState<{}> {
    commandCard?: CommandCard;
    towerSilhoutteRenderer?: TowerSilhoutteRenderer;
    addTowerActor?: AddTowerActor;
    onEnterState(): void {
        this.commandCard = new TowerListCommandCard(
            this.scene.gameController.getEffectiveTowersList(),
            (towerType: TowerType) => {
                this.selectTowerForHover(towerType);
            }
        );
        this.addToKeyTracker(this.commandCard);
        this.scene.commandCardRenderer.synchronizeItems(this.commandCard);
    }
    
    onLeaveState(): void {
        this.wipeTowerSelection();
        if (this.commandCard) this.removeFromKeyTracker(this.commandCard);
        
    }

    wipeTowerSelection() {
        if (this.towerSilhoutteRenderer) {
            this.removeFromMouseTracker(this.towerSilhoutteRenderer);
            this.towerSilhoutteRenderer?.disable();
        }
        if (this.addTowerActor) {
            this.removeFromClickTracker(this.addTowerActor);
        }
    }

    selectTowerForHover(towerType: TowerType) {
        this.towerSilhoutteRenderer = new TowerSilhoutteRenderer(this.scene);
        this.towerSilhoutteRenderer.enable(towerType);
        this.addToMouseTracker(this.towerSilhoutteRenderer);
        this.addTowerActor = new AddTowerActor(this.scene, towerType);
        this.addTowerActor?.onActionSuccess(() => {
            console.log("here");
            this.wipeTowerSelection();
        });
        this.addToClickTracker(this.addTowerActor);
    }
    
}