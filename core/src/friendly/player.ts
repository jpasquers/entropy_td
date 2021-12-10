import { PlayerStateConfiguration } from "../config";

export class PlayerGameState {
    money: number;
    constructor(config: PlayerStateConfiguration) {
        this.money = config.startingMoney;
    }

    giveMoney(money: number) {
        this.money+=money;
    }

    canAfford(cost: number) {
        return this.money >= cost;
    }
    
    makePurchase(cost: number) {
        this.money -= cost;
    }
}
