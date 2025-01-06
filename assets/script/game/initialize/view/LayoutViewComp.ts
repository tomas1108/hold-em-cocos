import { _decorator } from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";

import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "../../common/config/GameUIConfig";

const { ccclass, property } = _decorator;

@ccclass("LayoutViewComp")
@ecs.register("LayoutView", false)
export class LayoutViewComp extends CCComp {
	start() {}

	reset() {
		this.node.destroy();
	}
}
