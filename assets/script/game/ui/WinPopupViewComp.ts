import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCVMParentComp } from "db://oops-framework/module/common/CCVMParentComp";
import { PlayerEvent } from "../player/PlayerEvent";
import { formattedStringToCards, getCardResPath } from "../../CardUtils";
import { Node } from "cc";
import { loadResSpriteAtlasToNode } from "../../SpriteHelper";

const { ccclass, property } = _decorator;

@ccclass("WinPopupViewComp")
@ecs.register("WinPopupView", false)
export class WinPopupViewComp extends CCVMParentComp {
	@property(Node)
	cards: Node[] = [];

	data: {
		winnerHand: string;
		content: string;
		amount: string;
	} = {
		winnerHand: "",
		content: "",
		amount: "",
	};

	start() {
		oops.message.on(PlayerEvent.CHANGE_TURN, this.handleChangeTurn, this);
		this.node.active = false;
		this.node.getChildByName("cards").active = false;
	}

	async handleChangeTurn(event: string, data: IChangeTurnData) {
		if (!data.matchData || !this.node || !this.node.getChildByName("cards"))
			return;
		const isHaveWinner = (data.matchData?.winners?.length ?? 0) > 0;
		const winMessage = data.matchData.winMessages || [];
		const lastWinMessage = winMessage[winMessage.length - 1];

		if (!lastWinMessage) return;
		const isShowdown = data.matchData.isShowdown;
		const bestHandCards = formattedStringToCards(
			lastWinMessage.bestHand || "[]",
		);

		this.node.active = isHaveWinner;
		this.node.getChildByName("cards").active = bestHandCards && isShowdown;

		this.data.winnerHand = lastWinMessage.winnerHand || "";
		this.data.content = lastWinMessage.content || "";
		this.data.amount = `+${lastWinMessage.amount}$`;

		if (bestHandCards && isShowdown) {
			for (let i = 0; i < bestHandCards.length; i++) {
				if (!this.cards[i]) return;
				const { path, sprite } = getCardResPath(
					bestHandCards[i].rank,
					bestHandCards[i].suit,
				);
				await loadResSpriteAtlasToNode(this.cards[i], path, sprite);
			}
		}

		setTimeout(() => {
			if (this.node?.getChildByName("cards")) {
				this.node.active = false;
				this.node.getChildByName("cards").active = false;
			}
		}, 7000);
	}

	reset() {
		oops.message.off(PlayerEvent.CHANGE_TURN, this.handleChangeTurn, this);
		this.node.destroy();
	}
}
