import { PixelCoordinate } from "entropy-td-core";
import { Publisher } from "../../common/publishers";
import { MouseMovement, MouseMovementPublisher, MouseScrollPublisher, ScrollEvent } from "../../common/publishers/input";
import { ifNegativeZero } from "../../common/util";


export interface CameraState {
    zoom: number;
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
}

export class CameraAdapter extends Publisher<CameraState>{
    private camera: Phaser.Cameras.Scene2D.Camera;
    constructor(camera: Phaser.Cameras.Scene2D.Camera) {
        super();
        this.camera = camera;
    }

    private publishCurrentState() {
        this.publishEvent(this.camera);
    }

    public setWidth(width: number) {
        this.camera.width = width;
        this.publishCurrentState();
    }

    public setHeight(height: number) {
        this.camera.height = height;
        this.publishCurrentState();
    }

    public setScrollX(scrollX: number) {
        this.camera.scrollX = scrollX;
        this.publishCurrentState();
    }

    public setScrollY(scrollY: number) {
        this.camera.scrollY = scrollY;
        this.publishCurrentState();
    }

    public setZoom(zoom: number) {
        this.camera.zoom = zoom;
        this.publishCurrentState();
    }

    public resizeToWindow() {
        this.setWidth(window.innerWidth);
        this.setHeight(window.innerHeight);
    }

    public toWorldPos(cameraPos: PixelCoordinate): PixelCoordinate {
        let worldPos = this.camera.getWorldPoint(cameraPos.pxCol, cameraPos.pxRow)
        return {
            pxCol: worldPos.x,
            pxRow: worldPos.y
        }
    }

    public centerWithin(globWidth: number, globHeight: number) {
        let halfGlobWidth = Math.floor(globWidth / 2);
        let halfGlobHeight = Math.floor(globHeight / 2);
        let halfCameraWidth = Math.floor(this.camera.width / 2);
        let halfCameraHeight = Math.floor(this.camera.height / 2);
        this.setScrollX(ifNegativeZero(halfGlobWidth - halfCameraWidth));
        this.setScrollY(ifNegativeZero(halfGlobHeight - halfCameraHeight));
    }

    
    enableCameraDrag(mouseMovementPublisher: MouseMovementPublisher) {
        mouseMovementPublisher.addObserver({
            id: "camera_drag",
            onEvent: (event: MouseMovement) => {
                if (event.rDrag) {
                    this.setScrollX(this.camera.scrollX - event.delta.pxCol);
                    this.setScrollY(this.camera.scrollY - event.delta.pxRow);
                }
            }
        });
    }

    public enableZoom(scrollPublisher: MouseScrollPublisher) {
        scrollPublisher.addObserver({
            id: "scroll_zoom_observer",
            onEvent: (event: ScrollEvent) => {
                console.log("zoom event");
                console.log(event);
                if (event.zoomIn) {
                    //TODO vary by amount.
                    this.setZoom(this.camera.zoom*1.05);
                }
                else {
                    this.setZoom(this.camera.zoom*0.95);
                }
            }
        })
    }
}