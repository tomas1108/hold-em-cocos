import { _decorator, Component, Node } from "cc";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { PlayerEvent } from "../../player/PlayerEvent";
import { oops } from "db://oops-framework/core/Oops";
import { v3 } from "cc";

const { ccclass, property } = _decorator;

@ccclass("CardViewComp")
export class CardViewComp extends CCComp {
	id: string;
	playerId: string;

	onAdded(playerId: string, id: string) {
		this.id = id;
		this.playerId = playerId;
	}

	start() {
		oops.message.on(PlayerEvent.HIGHLIGHT_CARDS, this.handleHighlight, this);
	}

	handleHighlight(event: string, data: IHighlightResponse) {
		if (!this.node) return;
		Object.keys(data.playerHighlightSet).map((key: string) => {
			if (key === this.playerId) {
				const cards = data.playerHighlightSet[key].cards;
				cards.map((card: ICardData) => {
					if (card.id === this.id) {
						this.node.scale = v3(1.1, 1.1, 0);
						this.node.setSiblingIndex(999);
					}
				});
			}
		});
	}

	reset() {
		this.node.destroy();
	}

	onDestroy() {
		oops.message.off(PlayerEvent.HIGHLIGHT_CARDS, this.handleHighlight, this);
		this.node.destroy();
	}
}
