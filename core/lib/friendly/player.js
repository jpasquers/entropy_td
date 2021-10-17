export class PlayerState {
    money;
    constructor(config) {
        this.money = config.startingMoney;
    }
    canAfford(cost) {
        return this.money >= cost;
    }
    makePurchase(cost) {
        this.money -= cost;
    }
}
