import { Coordinate, GameBoard, PixelCoordinate } from "entropy-td-core/lib/game_board";
import { CommandCard } from "../command_card";
import { MouseMovementListener } from "../mouse_tracker";
import { TerrainRenderer } from "../renderers/board";
import { PlayerEventHandler } from "./player_event_handler";

export class DigitalInputMapper {
    input: Phaser.Input.InputPlugin;
    terrainRenderer: TerrainRenderer;
    playerEventHandler: PlayerEventHandler;
    commandCard?: CommandCard;

    constructor(input: Phaser.Input.InputPlugin,
        terrainRenderer: TerrainRenderer,
        playerEventHandler: PlayerEventHandler,
        commandCard?: CommandCard) {
        this.playerEventHandler = playerEventHandler;
        this.input = input;
        this.input.on("gameobjectdown", this.baseClickHandler.bind(this));
        this.input.keyboard.on("keydown", this.baseKeyHandler.bind(this));
        this.terrainRenderer = terrainRenderer;
        this.commandCard = commandCard;
    }



    public setCommandCard(commandCard: CommandCard) {
        this.commandCard = commandCard;
    }

    pixelFromPointer(input: Phaser.Input.Pointer): PixelCoordinate {
        return {
            pxCol: input.downX,
            pxRow: input.downY
        }
    }


    baseKeyHandler(event: KeyboardEvent): void {
        this.commandCard?.handleKeyboardEvent(event);
    }

    baseClickHandler(input: Phaser.Input.Pointer): void {
        let pixel: PixelCoordinate = this.pixelFromPointer(input);
        if (this.terrainRenderer.isPixelRelated(pixel)) {
            this.playerEventHandler.clickTerrain(
                this.terrainRenderer.getTileCoordForRenderedPixel(pixel));
        }
    }
    
}