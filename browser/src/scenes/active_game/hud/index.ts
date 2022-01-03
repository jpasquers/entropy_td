import { ActionError, GameOrchestrator, LiveTower, TowerType } from "entropy-td-core";
import { ActiveGameEventListener } from "..";
import { BasicScene } from "../..";
import { GameStatePublisher } from "../gamestate_publisher";
import { BorderedSubSceneRenderer } from "../world/renderers/scene_grid";
import { CommandCard, GlobalCommandCard, TowerCommandCard } from "./command_card";
import { CommandCardRenderer } from "./renderers/command_card";
import { ErrorRenderer } from "./renderers/error";
import { MoneyRenderer, TimeRenderer } from "./renderers/timer";
import { ActiveGameHudGrid } from "./scene_grid";

export class ActiveGameHudScene extends BasicScene {
    
    gameStatePublisher: GameStatePublisher;
    gameController: GameOrchestrator;
    hudGrid?: ActiveGameHudGrid;
    sceneGridRenderer?: BorderedSubSceneRenderer;
    commandCardRenderer?: CommandCardRenderer;
    timeRenderer?: TimeRenderer;
    moneyRenderer?: MoneyRenderer;
    errorRenderer?: ErrorRenderer;
    eventListener: ActiveGameEventListener;
    currentCommandCard?: CommandCard;

    constructor(gameController: GameOrchestrator, gameStatePublisher: GameStatePublisher,
        eventListener: ActiveGameEventListener) {
        super("active_game_hud");
        this.frameCount = 0;
        this.gameController = gameController;
        this.gameStatePublisher = gameStatePublisher;
        this.eventListener = eventListener;
    }

    private changeCommandCard(newCard: CommandCard) {
        if (this.currentCommandCard) {
            this.keyTracker?.remove(this.currentCommandCard);
        }
        this.currentCommandCard = newCard;
        this.keyTracker?.addObserver(this.currentCommandCard);
        this.commandCardRenderer!.synchronizeItems(this.currentCommandCard);
    }

    public resetToGlobal() {
        this.changeCommandCard(new GlobalCommandCard(
            this.gameController.getEffectiveTowersList(),
            (towerType: TowerType) => {
                this.eventListener.preSelectTowerForPlacement(towerType);
            }
        ));
    }

    public towerPlaced() {
        this.resetToGlobal();
    }

    public selectTower(tower: LiveTower) {
        this.changeCommandCard(
            new TowerCommandCard(tower, (tower) => {
                this.eventListener.sellTowerAction(tower);
            }, (tower, upgrade) => {
                //TODODODODODODO.
            })
        );
    }

    public towerPreSelect(towerType: TowerType) {
        //Idk which command card to show here.
    }

    public preload() {
        this.load.atlas("tower_simple_1_command_card", "/assets/tower_simple_1_command_card.png", "/assets/tower_simple_1_command_card.json");
        this.load.image('sell_tower', '/assets/sell_tower.png');
    }

    public create() {
        super.create();
        this.mainCameraAdapter?.resizeToWindow();
        this.hudGrid = new ActiveGameHudGrid(this);
        this.sceneGridRenderer = new BorderedSubSceneRenderer(this);
        this.sceneGridRenderer.synchronizeItems(...this.hudGrid.getBorderedSections());

        this.timeRenderer = new TimeRenderer(this.hudGrid.gamePlayerStatsSection);
        this.moneyRenderer = new MoneyRenderer(this.hudGrid.gamePlayerStatsSection);
        this.errorRenderer = new ErrorRenderer(this.hudGrid.notificationSection);
        this.commandCardRenderer = new CommandCardRenderer(this.hudGrid.commandCardSection);

        this.gameStatePublisher.addObservers(
            this.timeRenderer,
            this.moneyRenderer
        );

        

        //Default to this at first.
        this.resetToGlobal();
    }

    handleActionError(e: ActionError): void {
        this.errorRenderer?.renderError(e);
    }
}