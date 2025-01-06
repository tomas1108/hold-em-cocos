import { ScrollView } from "cc";
import { Prefab } from "cc";
import { instantiate } from "cc";
import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";

import { Node } from "cc";
import { smc } from "../../common/ecs/SingletonModuleComp";
import { RoomItemViewComp } from "../../ui/RoomItemViewComp";
import { UIID } from "../../common/config/GameUIConfig";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";

const { ccclass, property } = _decorator;

/** 视图层对象 */
@ccclass("RoomViewComp")
@ecs.register("RoomView", false)
export class RoomViewComp extends CCComp {
	@property(ScrollView)
	roomView: ScrollView;

	@property(Prefab)
	roomItem: Prefab;

	@property(Node)
	roomContent: Node;

	start() {
		this.loadRoomItem();
	}

	private async loadRoomItem() {
		try {
			await smc.player.loadRooms();
			const rooms = VM.getValue("Room.data");
			this.generateRoomItem(rooms);
		} catch (error) {
			oops.gui.toast(`${error}`);
		}
	}

	private generateRoomItem(items: IRoom[]) {
		for (const item of items) {
			const itemNode = instantiate(this.roomItem.data);
			itemNode.getComponent(RoomItemViewComp).onAdded(item);
			this.roomContent.addChild(itemNode);
		}
	}

	reset() {
		this.node.destroy();
	}
}
