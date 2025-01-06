import { _decorator, Node } from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCVMParentComp } from "db://oops-framework/module/common/CCVMParentComp";
import { GameEvent } from "../common/config/GameEvent";
import type { EventTouch } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "../common/config/GameUIConfig";

const { ccclass, property } = _decorator;

@ccclass("ButtonPlayViewComp")
@ecs.register("ButtonPlayView", false)
export class ButtonPlayViewComp extends CCVMParentComp {
	start() {
		this.on(GameEvent.ENTER_GAME, this.onHandler, this);
		this.on(GameEvent.EXIT_GAME, this.onHandler, this);
		this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
	}

	onHandler(event: string) {
		switch (event) {
			case GameEvent.ENTER_GAME:
				this.node.active = false;
				break;
			case GameEvent.EXIT_GAME:
				this.node.active = true;
				break;
		}
	}

	private onTouchEnd(event: EventTouch) {
		if (oops.gui.has(UIID.Home)) {
			oops.gui.remove(UIID.Home, true);
		}

		if (oops.gui.has(UIID.Table)) {
			oops.gui.remove(UIID.Table, true);
		}

		if (oops.gui.has(UIID.Match)) {
			oops.gui.remove(UIID.Match, true);
		}

		if (oops.gui.has(UIID.Room)) return;
		oops.gui.openAsync(UIID.Room);

		event.propagationStopped = true;
	}

	reset() {
		this.node.destroy();
	}
}
