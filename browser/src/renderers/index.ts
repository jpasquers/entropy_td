import { PixelCoordinate } from "entropy-td-core/lib/game_board";

export interface BorderedSceneSubSection {
    id: string;
    scene: Phaser.Scene;
    internalOffset: PixelCoordinate;
    internalWidth: number;
    internalHeight: number;
}

interface WithIdentifier {
    id: string;
}

export interface ObjectStore<T> {
    [creepid: string]: T;
}

interface RendererConfig {
    withCleanup: boolean;
    alwaysCreate: boolean;
}

export interface GameObjectLike {
    destroy: ()=>void;
}



export abstract class CustomRenderer<Model extends WithIdentifier, 
    PhaserType extends GameObjectLike> {
    store: ObjectStore<PhaserType>;
    config: RendererConfig;
    currentModels: Model[];

    constructor(config: RendererConfig) {
        this.store = {};
        this.config = config;
        this.currentModels = [];
    }

    public renderAll(items: Model[]): void  {
        items.forEach(item => this.render(item));

        if(this.config.withCleanup) {
            for(let id in this.store) {
                if (!items.find(item => item.id === id)) {
                    this.cleanup(this.store[id]);
                }
            }
        }

        this.currentModels = items;

    }

    public renderOne(item: Model): void {
        this.render(item);
        this.currentModels = [item];
    }

    private render(item: Model): void {
        
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



    cleanup(phaserObj: PhaserType): void {
        phaserObj.destroy();
    }


}

export abstract class SubSectionRenderer<Model extends WithIdentifier, 
    PhaserType extends GameObjectLike> extends CustomRenderer<Model,PhaserType> {
    sceneSection: BorderedSceneSubSection;

    constructor(scene: BorderedSceneSubSection, config: RendererConfig) {
        super(config);
        this.sceneSection = scene;
    }

    isPixelRelated(pixel: PixelCoordinate): boolean {
        //Override to enable inputs to be passed through to action mapper.
        return false;
    }
}

export type RenderWithOffset<T> = (scene: BorderedSceneSubSection, toRender: T, additionalConfig?: any) => void;
