import { PixelCoordinate } from "entropy-td-core/lib/game_board";
import { RenderWithOffset, BorderedSceneSubSection } from ".";
import { WALKING_PATH_LAYER } from "../z_layers";

let segments: Phaser.GameObjects.Line[][] = [];
let currentPaths: PixelCoordinate[][] = [];

let colorChoices = [
    0xf78c77,
    0xa3d7ff,
    0xff9cfc,
    0xfaed7d,
    0xedffbf
]

export const renderWalkingPaths: RenderWithOffset<PixelCoordinate[][]> = (sceneSection: BorderedSceneSubSection,
    paths: PixelCoordinate[][]) => {
    if (!pathsAreTheSame(currentPaths, paths)) {
        destroyAll();
        generateLines(sceneSection, paths);
        currentPaths = paths;
    }
    
}

export const destroyAll = (): void => {
    segments.forEach((segment) => {
       segment.forEach(line => {
           line.destroy();
       })
    })
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

const generateLines = (sceneSection: BorderedSceneSubSection,
    paths: PixelCoordinate[][]) => {

    segments = paths.map((path,segmentIdx) => {
        let segmentLines: Phaser.GameObjects.Line[] = [];
        let colorForSegment = colorChoices[segmentIdx];
        path.forEach((point,idx) => {
            if (idx === path.length-1) return;
            let line = sceneSection.scene.add.line(undefined,undefined,
                point.pxCol + sceneSection.internalOffset.pxCol,
                point.pxRow + sceneSection.internalOffset.pxRow,
                path[idx+1].pxCol + sceneSection.internalOffset.pxCol,
                path[idx+1].pxRow + sceneSection.internalOffset.pxRow,
                colorForSegment,
                0.3
            )
            line.setZ(WALKING_PATH_LAYER);
            //I dont understand this and it makes me nervous lol. But an issue tracker mentioned it.
            line.setOrigin(0,0);
            segmentLines.push(line);
        });
        return segmentLines;
    });
    console.log(segments);
}

const randomColor = (): number => {
    return Math.floor(Math.random()*16777215);
}

const updateRopes = (sceneSection: BorderedSceneSubSection,
    paths: PixelCoordinate[][]) => {

}