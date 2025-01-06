import { Label } from "cc";
import { CCInteger } from "cc";
import { tween } from "cc";
import { ProgressBar } from "cc";
import { _decorator, Component, Node } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import type { Tween } from "cc";
import { TableEvent } from "../../player/TableEvent";

const { ccclass, property } = _decorator;

@ccclass("SpinViewComp")
export class SpinViewComp extends Component {
	@property(ProgressBar)
	progressBar: ProgressBar;

	@property(Label)
	label: Label;

	@property({ type: CCInteger })
	countdownTime = 9;

	private currentCount = 0;
	private activeTween: Tween;
	private playerId: string;
	private audioPlay = false;

	onAdded(playerId: string) {
		this.playerId = playerId;
	}

	start() {}

	onLoad() {
		this.node.on(
			Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED,
			this.onActiveChanged,
			this,
		);
	}

	onActiveChanged() {
		if (this.node.activeInHierarchy) {
			this.audioPlay = false;
			this.startCountdown(this.countdownTime);
		} else if (this.activeTween) {
			this.activeTween.stop();
		}
	}

	startCountdown(duration: number) {
		if (!this.progressBar) return;

		if (this.activeTween) {
			this.activeTween.stop();
		}
		this.currentCount = duration;
		this.updateLabel(this.currentCount);
		this.drawCircle(0);

		this.activeTween = tween(this.progressBar)
			.to(
				duration,
				{ progress: 1 },
				{
					progress(start, end, current, ratio) {
						return ratio;
					},
					onUpdate: (target, ratio?: number) => {
						const remainingTime = Math.ceil(duration * (1 - (ratio || 0)));
						this.updateLabel(remainingTime);
					},
				},
			)

			.call(() => {
				oops.audio.stopMusic();
				this.onCountdownComplete();
			})
			.start();
	}

	resetCountdown() {
		if (this.progressBar) this.progressBar.progress = 0;
	}

	setCountdownTime(time: number) {
		this.countdownTime = time;
		if (this.node.activeInHierarchy) {
			this.startCountdown(time);
		}
	}

	updateLabel(value: number) {
		if (this.label) {
			this.label.string = `${value - 2 > 0 ? value - 2 : 0}s`;
		}
		if (value - 2 <= 4 && !this.audioPlay) {
			this.audioPlay = true;
			oops.audio.playMusic("audios/sound_countdown");
		}
	}

	drawCircle(ratio: number) {
		if (this.progressBar) this.progressBar.progress = ratio;
	}

	async onCountdownComplete() {
		this.audioPlay = false;
		oops.message.dispatchEvent(TableEvent.UPDATE_FOLD, this.playerId);
	}

	reset() {
		if (this.activeTween) {
			this.activeTween.stop();
		}
		this.node.destroy();
	}

	onDestroy() {
		if (this.activeTween) {
			this.activeTween.stop();
		}
		this.node.off(
			Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED,
			this.onActiveChanged,
			this,
		);
	}
}
