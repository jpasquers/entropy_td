import { ActionError, ActionHandler } from "entropy-td-core/lib/actions/action_handler";
import { BasicScene } from "../../scenes";
import { ErrorRenderer } from "../../scenes/active_game/renderers/error";

export abstract class ActionBridge<Scene extends BasicScene> {
    actionHandler: ActionHandler;
    scene: Scene;
    onSuccess?: ()=>void;
    constructor(actionHandler: ActionHandler, scene: Scene, onSuccess?: ()=>void) {
        this.actionHandler = actionHandler;
        this.scene = scene;
        this.onSuccess = onSuccess;
    }

    onActionSuccess(fn: ()=>void): ActionBridge<Scene> {
        this.onSuccess = fn;
        return this;
    }

    attemptAction(action: ()=>void) {
        try {
            action();
            this.onSuccess?.();
        }
        catch(e) {
            if (e instanceof ActionError) {
                this.scene.handleActionError(e);
            }
        }
    }
}