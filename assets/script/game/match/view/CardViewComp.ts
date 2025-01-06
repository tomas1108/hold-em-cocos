import { _decorator, Component, Node } from "cc";
import { CCComp } from "db://oops-framework/module/common/CCComp";

const { ccclass, property } = _decorator;

@ccclass("CardViewComp")
export class CardViewComp extends CCComp {
	id: string;

	onAdded(id: string) {
		this.id = id;
	}

	start() {}

	reset() {
		this.node.destroy();
	}

	onDestroy() {
		this.node.destroy();
	}
}
