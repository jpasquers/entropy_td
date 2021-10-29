import { DisplayContext } from "../../phaser/extensions/display_context";
import { BorderedSubScene } from "../../phaser/extensions/sub_scene";


export interface WithIdentifier {
    id: string;
}

export interface ObjectStore<T> {
    [creepid: string]: T;
}

export interface RendererConfig {
    withCleanup: boolean;
    alwaysCreate: boolean;
}

export interface GameObjectLike {
    destroy: ()=>void;
}

//Probably a code smell? Hard to tell
export class NoOp implements GameObjectLike {
    destroy() {
        
    }
}

export abstract class SimpleRenderer<PhaserType extends GameObjectLike> {
    displayContext: DisplayContext;

    constructor(displayContext: DisplayContext) {
        this.displayContext = displayContext;
    }

    cleanup(phaserObj: PhaserType): void {
        phaserObj.destroy();
    }
}

export abstract class ObjectRendererWithSync<Model extends WithIdentifier, 
    PhaserType extends GameObjectLike> extends SimpleRenderer<PhaserType> {
    store: ObjectStore<PhaserType>;
    config: RendererConfig;
    currentModels: Model[];

    constructor(config: RendererConfig, displayContext: DisplayContext) {
        super(displayContext);
        this.store = {};
        this.config = config;
        this.currentModels = [];
    }

    public synchronizeItems(...items: Model[]): void {
        items.forEach(item => this.synchronizeItem(item));

        if(this.config.withCleanup) {
            for(let id in this.store) {
                if (!items.find(item => item.id === id)) {
                    this.cleanup(this.store[id]);
                }
            }
        }

        this.currentModels = items;
    }

    private synchronizeItem(item: Model): void {
        
        if (this.config.alwaysCreate) {
            this.create(item);
        }
        else if (item.id in this.store) {
            this.update(item, this.store[item.id]);
        }
        else {
            let asset = this.create(item);
            this.store[item.id] = asset;
        }

    }

    abstract create(item: Model): PhaserType;

    abstract update(item: Model, phaserObj: PhaserType): void;



}

export type RenderWithOffset<T> = (scene: BorderedSubScene, toRender: T, additionalConfig?: any) => void;
