import { Sprite } from "cc";
import { Label } from "cc";
import { _decorator, Component, Node } from "cc";
import { oops } from "db://oops-framework/core/Oops";

const { ccclass, property } = _decorator;

@ccclass("StatusViewComp")
export class StatusViewComp extends Component {
	@property(Label)
	label: Label;

	@property(Node)
	status: Node;

	start() {}

	onAdded(amount: number, type: string) {
		const canHaveAmount =
			type === "RAISE" ||
			type === "FULL" ||
			type === "HALF" ||
			type === "QUARTER" ||
			type === "ALLIN";

		if (amount && canHaveAmount) {
			this.label.string = `${amount} $`;
		}

		this.loadStatus(type);
	}

	onLoad() {}

	loadStatus(type: string) {
		switch (type) {
			case "QUARTER":
				this.status.getComponent(Sprite).spriteFrame = this.status
					.getComponent(Sprite)
					.spriteAtlas?.getSpriteFrame("quarter");
				oops.audio.playMusic("audios/quarter_boy");
				break;
			case "HALF":
				this.status.getComponent(Sprite).spriteFrame = this.status
					.getComponent(Sprite)
					.spriteAtlas?.getSpriteFrame("half");
				oops.audio.playMusic("audios/half_boy");
				break;
			case "FULL":
				this.status.getComponent(Sprite).spriteFrame = this.status
					.getComponent(Sprite)
					.spriteAtlas?.getSpriteFrame("full");
				oops.audio.playMusic("audios/full_boy");
				break;
			case "ALLIN":
				this.status.getComponent(Sprite).spriteFrame = this.status
					.getComponent(Sprite)
					.spriteAtlas?.getSpriteFrame("allin");
				oops.audio.playMusic("audios/all_boy");
				break;
			case "FOLD":
				this.status.getComponent(Sprite).spriteFrame = this.status
					.getComponent(Sprite)
					.spriteAtlas?.getSpriteFrame("fold");
				oops.audio.playMusic("audios/fold_boy");
				break;
			case "RAISE":
				this.status.getComponent(Sprite).spriteFrame = this.status
					.getComponent(Sprite)
					.spriteAtlas?.getSpriteFrame("raise");
				oops.audio.playMusic("audios/raise_boy");
				break;

			case "CHECK":
				this.status.getComponent(Sprite).spriteFrame = this.status
					.getComponent(Sprite)
					.spriteAtlas?.getSpriteFrame("check");
				oops.audio.playMusic("audios/check_boy");
				break;
			case "CALL":
				this.status.getComponent(Sprite).spriteFrame = this.status
					.getComponent(Sprite)
					.spriteAtlas?.getSpriteFrame("call");
				oops.audio.playMusic("audios/call_boy");
				break;
		}
	}

	reset() {
		this.node.destroy();
	}

	onDestroy() {}
}
