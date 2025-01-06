import type { EventTouch } from "cc";
import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { CCVMParentComp } from "db://oops-framework/module/common/CCVMParentComp";
import { UIID } from "../common/config/GameUIConfig";

const { ccclass, property } = _decorator;

@ccclass("RoomItemViewComp")
@ecs.register("RoomItemView", false)
export class RoomItemViewComp extends CCVMParentComp {
	data: IRoom;
	onAdded(data: IRoom) {
		this.data = data;
	}

	start() {}

	private btn_join(e: EventTouch) {
		oops.gui.open(UIID.Table, this.data.id);
	}

	reset() {
		this.node.destroy();
	}
}
