import type { EventTouch } from "cc";
import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { UIID } from "../common/config/GameUIConfig";
import { CCVMParentComp } from "db://oops-framework/module/common/CCVMParentComp";

const { ccclass, property } = _decorator;

@ccclass("TableItemViewComp")
@ecs.register("TableItemView", false)
export class TableItemViewComp extends CCVMParentComp {
	data: ITableData;
	onAdded(data: ITableData) {
		this.data = data;
	}

	start() {}

	private btn_join(e: EventTouch) {
		if (oops.gui.has(UIID.Table_Confirm)) {
			oops.gui.remove(UIID.Table_Confirm, true);
		}

		oops.gui.open(UIID.Table_Confirm, this.data);
	}

	reset() {
		this.node.destroy();
	}
}
