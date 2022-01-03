export interface Observer<EventType> {
    id: string;
    onEvent(event: EventType):void;
}



export class Publisher<EventType> {
    observers: Observer<EventType>[];

    constructor(observers?: Observer<EventType>[]) {
        this.observers = observers ?? [];
    }

    public addObserver(observer: Observer<EventType>) {
        this.observers.push(observer);
    }

    public addObservers(...observers: Observer<EventType>[]) {
        this.observers.push(...observers)
    }

    public removeIf(removeIf: (obs: Observer<EventType>)=>boolean) {
        this.observers = this.observers.filter(obs => !removeIf(obs));
    }

    public remove(target: Observer<EventType>) {
        this.removeIf((obs => {
            return obs.id === target.id
        }));
    }

    publishEvent(event: EventType) {
        this.observers.forEach(observer => observer.onEvent(event));
    }

}

export class PublisherWithReference<EventType> extends Publisher<EventType> {
    latestEvent?: EventType;

    constructor(observers?: Observer<EventType>[]) {
        super(observers);
    }

    public getReference(): EventType | undefined{
        return this.latestEvent;
    }

    publishEvent(event: EventType): void {
        super.publishEvent(event);
        this.latestEvent = event;
    }
}