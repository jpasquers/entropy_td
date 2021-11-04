
export type WeightFn = (x: number)=>number;

export interface RandomizableRange {
    minValIncl: number;
    maxValIncl: number;
    stepper: number;
    weightFnKey: string;
}

export const isRandomizableRange = (val: unknown): val is RandomizableRange => {
    return typeof val === "object" && !(!val) &&
        "maxValIncl" in val &&
        "minValIncl" in val &&
        "stepper" in val &&
        "weightFnKey" in val;
}

export const Even: WeightFn = (x:number) => 10;

export const weightFns: Record<string,WeightFn> = {
    EVEN: Even
}

export const getWeightFn = (weightFnKey: string): WeightFn => {
    return weightFns[weightFnKey];
}

/**
 * If the maxValue is not an even amount of steps from the minValue, the max value will still be added in addition
 * to the closest piece before that. E.x.
 * 
 * 1->5 by 1.5 = 1, 2.5, 4, 5
 */
const getValueSet = ({maxValIncl, minValIncl, stepper}: RandomizableRange): number[] => {
    //Simple for loop really is easier and more clear here.
    let values = [];
    for (let i=minValIncl; i<maxValIncl; i+=stepper) {
        values.push(i);
    }
    values.push(maxValIncl);
    return values;
}

const getWeightSum = (valueSet: number[], weightFn: WeightFn): number => {
    return valueSet.map(x=> weightFn(x))
        .reduce((prev,curr) => prev+curr, 0);
}

export const choose = (randomizableRange: RandomizableRange): number => {
    let weightFn = weightFns[randomizableRange.weightFnKey];
    let valueSet = getValueSet(randomizableRange);
    let weightSum = getWeightSum(valueSet, weightFn);
    let randomWeight = Math.floor(Math.random()*weightSum);
    let decision = -1;
    let found = false;
    valueSet.forEach((value) => {
        if (found) return;
        randomWeight = randomWeight - weightFn(value);
        if (randomWeight <= 0) {
            decision = value;
            found = true;
        }
    })

    return decision;
}