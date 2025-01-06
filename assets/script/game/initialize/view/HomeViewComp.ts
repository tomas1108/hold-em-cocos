import { _decorator } from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";

const { ccclass, property } = _decorator;

@ccclass("HomeViewComp")
@ecs.register("HomeView", false)
export class HomeViewComp extends CCComp {
	start() {}

	reset() {
		this.node.destroy();
	}
}
