import type { EventTouch } from "cc";
import { _decorator } from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { Node } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { Prefab } from "cc";
import { instantiate } from "cc";
import { getNodePosition } from "../../../PositionUtils";
import { GameEvent } from "../../common/config/GameEvent";

const { ccclass, property } = _decorator;

@ccclass("AccountViewComp")
@ecs.register("AccountView", false)
export class AccountViewComp extends CCComp {
	@property(Prefab)
	dropdownPrefab: Prefab;

	private dropdown: Node;
	private inGame = false;

	start() {
		this.dropdown = instantiate(this.dropdownPrefab);
		oops.gui.root.on(Node.EventType.TOUCH_START, this.close_dropdown, this);

		this.on(GameEvent.CLOSE_DROPDOWN, this.close_dropdown, this);
		this.on(GameEvent.ENTER_GAME, this.onHandler, this);
		this.on(GameEvent.EXIT_GAME, this.onHandler, this);
	}

	onHandler(event: string) {
		switch (event) {
			case GameEvent.ENTER_GAME:
				this.inGame = true;
				break;
			case GameEvent.EXIT_GAME:
				this.inGame = false;
				break;
		}
	}

	private btn_dropdown(event: EventTouch) {
		const pos = getNodePosition(oops.gui.root, this.node);
		this.dropdown.setPosition(pos.x - 10, pos.y - (100 + this.node.h));
		this.dropdown.active = !this.inGame;
		oops.gui.root.addChild(this.dropdown);
	}

	private close_dropdown() {
		if (this.dropdown?.active) {
			this.dropdown.active = false;
		}
	}

	reset() {
		oops.gui.root.off(Node.EventType.TOUCH_START, this.close_dropdown, this);
		this.node.destroy();
	}
}
