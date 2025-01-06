import { Slider } from "cc";
import { Sprite } from "cc";
import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { Node } from "cc";
import { CCVMParentComp } from "db://oops-framework/module/common/CCVMParentComp";

const { ccclass, property } = _decorator;

@ccclass("VolumeViewComp")
@ecs.register("VolumeView", false)
export class VolumeViewComp extends CCVMParentComp {
	@property(Slider)
	slider: Slider;

	@property(Sprite)
	icon: Sprite;

	start() {
		this.slider.progress = 0.5;
		this.icon.node.on(Node.EventType.TOUCH_START, this.toggle_mute, this);
	}

	private slide(event: Slider) {
		this.update_volume(event.progress);
		oops.audio.volumeMusic = event.progress;
	}

	private toggle_mute() {
		if (this.slider.progress.toFixed(1) === "0.0") {
			this.slider.progress = 0.5;
			oops.audio.volumeMusic = 0.5;
		} else {
			this.slider.progress = 0;
			oops.audio.volumeMusic = 0;
		}
		this.update_volume(this.slider.progress);
	}

	private update_volume(process: number) {
		if (process.toFixed(1) === "0.0") {
			this.icon.spriteFrame =
				this.icon.spriteAtlas.getSpriteFrame("volume_mute");
		}

		if (process > 0 && process <= 0.5) {
			this.icon.spriteFrame = this.icon.spriteAtlas.getSpriteFrame("volume_1");
		}

		if (process > 0.5 && process < 1) {
			this.icon.spriteFrame = this.icon.spriteAtlas.getSpriteFrame("volume_2");
		}

		if (process.toFixed(1) === "1.0") {
			this.icon.spriteFrame = this.icon.spriteAtlas.getSpriteFrame("volume_3");
		}
	}

	reset() {
		this.node.destroy();
	}

	onDestroy() {
		this.icon.node.off(Node.EventType.TOUCH_START, this.toggle_mute, this);
	}
}
