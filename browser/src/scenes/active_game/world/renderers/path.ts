import { PixelCoordinate } from "entropy-td-core";
import { GameState } from "entropy-td-core";
import { GameStateObjectRenderer } from ".";
import { GameObjectLike, SimpleRenderer } from "../../../../common/renderer";
import { WALKING_PATH_LAYER } from "../../../../common/z_layers";
import { forSubScene, DisplayContext } from "../../../../phaser/extensions/display_context";
import { SubScene } from "../../../../phaser/extensions/sub_scene";
import { ObjectAnimator } from "../../../../phaser/extensions/tween";
import { GameStateObserver } from "../../gamestate_publisher";


class OptimalPathSet implements GameObjectLike {
    paths: OptimalPath[];

    constructor(paths: OptimalPath[]) {
        this.paths = paths;
    }

    destroy() {
        this.paths.forEach((path) => path.destroy());
    }
    
}

class OptimalPath implements GameObjectLike {
    lines: Phaser.GameObjects.Line[];
    
    constructor(lines: Phaser.GameObjects.Line[], tweenDelegate: ObjectAnimator) {
        this.lines = lines;
        tweenDelegate.blink(this.lines);
    }

    destroy() {
        this.lines.forEach(line => line.destroy());
    }
    
}

let colorChoices = [
    0xf78c77,
    0xa3d7ff,
    0xff9cfc,
    0xfaed7d,
    0xedffbf
]

export class PathRenderer extends SimpleRenderer<OptimalPathSet> implements GameStateObserver {
    id: string;
    currentPaths: PixelCoordinate[][];
    optimalPathSet?: OptimalPathSet;
    tweenDelegate: ObjectAnimator;

    constructor(sceneSection: SubScene, tweenDelegate: ObjectAnimator) {
        super(forSubScene(sceneSection));
        this.currentPaths = [];
        this.id = "path_renderer";
        this.tweenDelegate = tweenDelegate;
    }

    onEvent(event: GameState): void {
        if (this.optimalPathSet && !pathsAreTheSame(this.currentPaths, event.optimalPathSegmentsPx)) {
            console.log("found path change");
            this.optimalPathSet.destroy();
            this.optimalPathSet = undefined;
        }
        if (!this.optimalPathSet) {
            let lines = generateLines(this.displayContext, event.optimalPathSegmentsPx, this.tweenDelegate);
            this.optimalPathSet = new OptimalPathSet(lines);
            this.currentPaths = event.optimalPathSegmentsPx;
        }
    }
}

//Expensive?
const pathsAreTheSame = (current: PixelCoordinate[][], next: PixelCoordinate[][]): boolean => {
    if (current.length !== next.length) return false;
    for (let i=0; i<current.length; i++) {
        if (current[i].length !== next[i].length) return false;
        for (let j=0; j<current[i].length; j++) {
            if (current[i][j].pxCol !== next[i][j].pxCol) return false;
            if (current[i][j].pxRow !== next[i][j].pxRow) return false;
        }
    }
    return true;
}

const generateLines = (displayContext: DisplayContext,
    paths: PixelCoordinate[][], tweenDelegate: ObjectAnimator): OptimalPath[] => {

    return paths.map((path,segmentIdx) => {
        let segmentLines: Phaser.GameObjects.Line[] = [];
        let colorForSegment = colorChoices[segmentIdx];
        path.forEach((point,idx) => {
            if (idx === path.length-1) return;
            let line = displayContext.addLine(point, path[idx+1],
                colorForSegment,
                0.3
            );
            line.setLineWidth(4);
            line.setZ(WALKING_PATH_LAYER);
            //I dont understand this and it makes me nervous lol. But an issue tracker mentioned it.
            line.setOrigin(0,0);
            segmentLines.push(line);
        });
        return new OptimalPath(segmentLines, tweenDelegate);
    });
}

const randomColor = (): number => {
    return Math.floor(Math.random()*16777215);
}

const updateRopes = (sceneSection: SubScene,
    paths: PixelCoordinate[][]) => {

}