import { view } from "cc";
import { UITransform } from "cc";
import { _decorator } from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";

const { ccclass, property } = _decorator;

@ccclass("MaskViewComp")
@ecs.register("MaskView", false)
export class MaskViewComp extends CCComp {
	start() {
		this.updateDemission();
	}

	private updateDemission() {
		const screenSize = view.getVisibleSize();
		const transform = this.node.getComponent(UITransform);
		if (transform) {
			transform.setContentSize(screenSize.width, screenSize.height);
		}
	}

	reset() {
		this.node.destroy();
	}
}
