import { UITransform } from "cc";
import { view } from "cc";
import { Layout } from "cc";
import { Sprite } from "cc";
import { _decorator } from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { GameEvent } from "../common/config/GameEvent";

const { ccclass, property } = _decorator;

@ccclass("HeaderViewComp")
@ecs.register("HeaderView", false)
export class HeaderViewComp extends CCComp {
	start() {
		const screenSize = view.getVisibleSize();
		this.node.getComponent(UITransform).width = screenSize.width;

		const layout = this.node.getComponent(Layout);
		layout.spacingX = screenSize.width - (105 + 693);

		this.on(GameEvent.ENTER_GAME, this.onHandler, this);
		this.on(GameEvent.EXIT_GAME, this.onHandler, this);
	}

	onHandler(event: string) {
		const layout = this.node.getComponent(Layout);
		switch (event) {
			case GameEvent.ENTER_GAME:
				layout.spacingX = layout.spacingX + 110;
				break;
			case GameEvent.EXIT_GAME:
				layout.spacingX = layout.spacingX - 110;
				break;
		}
	}

	reset() {
		this.node.destroy();
	}
}
