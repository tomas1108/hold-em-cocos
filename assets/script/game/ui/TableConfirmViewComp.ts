import { Label } from "cc";
import { EditBox } from "cc";
import type { EventTouch } from "cc";
import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { smc } from "../common/ecs/SingletonModuleComp";
import { UIID } from "../common/config/GameUIConfig";
import { CCVMParentComp } from "db://oops-framework/module/common/CCVMParentComp";

const { ccclass, property } = _decorator;

@ccclass("TableConfirmViewComp")
@ecs.register("TableConfirmView", false)
export class TableConfirmViewComp extends CCVMParentComp {
	@property(EditBox)
	buy: EditBox | null = null;

	data: ITableData;

	onAdded(data: ITableData) {
		this.data = data;
	}

	start() {}

	private async btn_start(e: EventTouch) {
		try {
			const buy = this.buy.string;
			await smc.player.joinTable(this.data, buy);
		} catch (error) {
			oops.gui.toast(`${error}`);
		}
	}

	private btn_close(e: EventTouch) {
		oops.gui.remove(UIID.Table_Confirm, true);
	}

	reset() {
		this.node.destroy();
	}
}
