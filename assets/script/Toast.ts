import { Node } from "cc";
import { Sprite } from "cc";
import { Label, _decorator } from "cc";
import { Notify } from "db://oops-framework/core/gui/prompt/Notify";
import { LanguageLabel } from "db://oops-framework/libs/gui/language/LanguageLabel";

const { ccclass, property } = _decorator;

@ccclass("Toast")
export class Toast extends Notify {
	@property(Node)
	private close: Node;

	@property(Label)
	private labContent: Label;

	start(): void {
		this.close.on(
			Node.EventType.TOUCH_END,
			() => {
				this.node.destroy();
			},
			this,
		);
	}

	error(msg: string, useI18n: boolean) {
		const sprite = this.node.getComponent(Sprite);
		if (sprite) {
			sprite.spriteFrame = sprite.spriteAtlas?.getSpriteFrame("notify_error");
		}

		const label = this.labContent.getComponent(LanguageLabel);
		if (label) {
			if (useI18n) {
				label.enabled = true;
				label.dataID = msg;
			} else {
				label.enabled = false;
				this.labContent.string = msg;
			}
		}
	}

	success(msg: string, useI18n: boolean) {
		const sprite = this.node.getComponent(Sprite);
		if (sprite) {
			sprite.spriteFrame = sprite.spriteAtlas?.getSpriteFrame("notify_success");
		}

		const label = this.labContent.getComponent(LanguageLabel);
		if (label) {
			if (useI18n) {
				label.enabled = true;
				label.dataID = msg;
			} else {
				label.enabled = false;
				this.labContent.string = msg;
			}
		}
	}

	warning(msg: string, useI18n: boolean) {
		const sprite = this.node.getComponent(Sprite);
		if (sprite) {
			sprite.spriteFrame = sprite.spriteAtlas?.getSpriteFrame("notify_warning");
		}

		const label = this.labContent.getComponent(LanguageLabel);
		if (label) {
			if (useI18n) {
				label.enabled = true;
				label.dataID = msg;
			} else {
				label.enabled = false;
				this.labContent.string = msg;
			}
		}
	}

	toast(msg: string, useI18n: boolean) {
		const type = msg.split(":")[0];
		const message = msg.split(":")[1].trim();
		switch (type) {
			case "Error":
				this.error(message, useI18n);
				break;
			case "Success":
				this.success(message, useI18n);
				break;
			case "Warning":
				this.warning(message, useI18n);
				break;
			default:
				this.labContent.string = msg;
				break;
		}
	}
}
