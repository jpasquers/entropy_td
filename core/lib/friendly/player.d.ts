export declare class PlayerState {
    money: number;
    constructor(config: PlayerStateConfiguration);
    canAfford(cost: number): boolean;
    makePurchase(cost: number): void;
}
export interface PlayerStateConfiguration {
    startingMoney: number;
}
