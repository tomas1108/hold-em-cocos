import { ScrollView } from "cc";
import { Prefab } from "cc";
import { instantiate } from "cc";
import { UITransform } from "cc";
import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { TableItemViewComp } from "../../ui/TableItemViewComp";
import { UIID } from "../../common/config/GameUIConfig";
import { Node } from "cc";
import { smc } from "../../common/ecs/SingletonModuleComp";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";

const { ccclass, property } = _decorator;

@ccclass("TableViewViewComp")
@ecs.register("TableViewView", false)
export class TableViewViewComp extends CCComp {
	@property(ScrollView)
	tableView: ScrollView;

	@property(Prefab)
	tableItem: Prefab;

	@property(Node)
	tableContent: Node;

	private roomId;

	onAdded(roomId: string) {
		this.roomId = roomId;
		VM.setValue("Match.roomId", roomId);
	}

	start() {
		this.loadTableItems();
	}

	private async loadTableItems() {
		if (!this.roomId) return;
		try {
			await smc.player.loadTables(this.roomId);
			const tables = VM.getValue("Table.data");
			this.generateTableItem(tables);
			this.updateScrollView();
		} catch (error) {
			oops.gui.toast(`${error}`);
		}
	}

	private generateTableItem(items: ITableData[]) {
		for (const item of items) {
			const itemNode = instantiate(this.tableItem);
			itemNode.getComponent(TableItemViewComp).onAdded(item);
			this.tableContent.addChild(itemNode);
		}
	}

	private updateScrollView() {
		if (this.tableView?.view) {
			const totalItem = VM.getValue("Table.pageCount");
			this.tableView.view.node
				.getChildByName("content")
				.getComponent(UITransform).height = (totalItem / 2) * 200 + 100;
			this.tableView?.scrollToTop();
		}
	}

	reset() {
		this.node.destroy();
	}
}
