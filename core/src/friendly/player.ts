export class PlayerState {
    money: number;
    constructor(config: PlayerStateConfiguration) {
        this.money = config.startingMoney;
    }

    canAfford(cost: number) {
        return this.money >= cost;
    }
    
    makePurchase(cost: number) {
        this.money -= cost;
    }
}

export interface PlayerStateConfiguration {
    startingMoney: number;
}