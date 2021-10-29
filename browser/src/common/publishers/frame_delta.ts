import { Observer, Publisher } from ".";

export interface FrameDeltaEvent {
    delta: number;
}

export type FrameDeltaObserver = Observer<FrameDeltaEvent>;

export class FrameDeltaPublisher extends Publisher<FrameDeltaEvent> {
    
}