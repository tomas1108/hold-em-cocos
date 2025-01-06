import { UITransform } from "cc";
import { view } from "cc";
import { Layout } from "cc";
import { _decorator } from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { GameEvent } from "../common/config/GameEvent";
import { smc } from "../common/ecs/SingletonModuleComp";

const { ccclass, property } = _decorator;

@ccclass("AccountDropdownViewComp")
@ecs.register("AccountDropdownView", false)
export class AccountDropdownViewComp extends CCComp {
	start() {}

	async logout() {
		await smc.account.logout();
	}

	reset() {
		this.node.destroy();
	}
}
