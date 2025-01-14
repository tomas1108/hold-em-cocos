import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCVMParentComp } from "db://oops-framework/module/common/CCVMParentComp";
import { PlayerEvent } from "../../player/PlayerEvent";
import { Node } from "cc";
import type { Vec3 } from "cc";
import { getNodePosition } from "../../../PositionUtils";
import { smc } from "../../common/ecs/SingletonModuleComp";
import {
	flipCardToNode,
	getCardResPath,
	tweenCardToNode,
} from "../../../CardUtils";
import { UITransform } from "cc";
import { Size } from "cc";
import { v3 } from "cc";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";
import { SpinViewComp } from "./SpinViewComp";
import { Sprite } from "cc";
import { CardViewComp } from "./CardViewComp";
import { loadResSpriteAtlasToNode } from "../../../SpriteHelper";
import { StatusViewComp } from "./StatusViewComp";

const { ccclass, property } = _decorator;

@ccclass("PlayerViewComp")
@ecs.register("PlayerView", false)
export class PlayerViewComp extends CCVMParentComp {
	@property(Node)
	cards: Node[] = [];

	@property(Node)
	turn: Node;

	@property(Node)
	slind: Node;

	@property(Node)
	fold: Node;

	@property(Node)
	winHat: Node;

	@property(Node)
	wait: Node;

	@property(Node)
	status: Node;

	data: Partial<IPlayerTableData> = {
		isTurn: false,
	};

	start() {
		oops.message.on(PlayerEvent.LEAVE_TABLE, this.handleLeaveTable, this);
		oops.message.on(PlayerEvent.MATCH_STARTED, this.handleMatchStarted, this);
		oops.message.on(PlayerEvent.CHANGE_TURN, this.handleChangeTurn, this);
		oops.message.on(
			PlayerEvent.PLAYERS_UPDATED,
			this.handlePlayersUpdated,
			this,
		);

		this.turn.getComponent(SpinViewComp).onAdded(this.data.id);
	}

	onAdded(data: IPlayerTableData): void {
		this.data = data;
	}

	handleMatchStarted(event: string, data: IMathStartedData) {
		this.clearCards();
		this.dealCard();

		if (this.turn) this.turn.active = this.data?.id === data.playerId;
		if (this.winHat) this.winHat.active = false;
		if (this.status) this.status.active = false;

		this.checkTurn();
		this.updateSlind(data);
	}

	handlePlayersUpdated(event: string, data: IUpdatePlayerData) {
		const player = data.players.find((item) => item.id === this.data?.id);
		if (player && this.data) {
			this.data.stack = player.stack;
		}
		this.checkFold(data);
		this.checkWinner(data);
		this.checkWait(data);

		const participant = data.match?.participants.find(
			(item) => item.playerId === VM.getValue("Match.player")?.id,
		) as IParticipant;
		if (!participant) {
			if (!this.cards?.length) return;
			if (!this.cards[0]?.children?.length) {
				this.dealCard();
			}

			if (data.match.winners?.length > 0) {
				for (const participant of data.match.participants) {
					if (participant.playerId === this.data?.id) {
						if (!participant?.isFolded) {
							oops.audio.playMusic("audios/sound_open");
							this.cards?.map((card: Node, index: number) => {
								if (!card.getChildByName("card")) return;

								const cardNode = card.getChildByName("card");
								const rank =
									index === 0
										? participant?.cardOne?.rank
										: participant?.cardTwo?.rank;
								const suit =
									index === 0
										? participant?.cardOne?.suit
										: participant?.cardTwo?.suit;
								const id =
									index === 0 ? participant?.cardOneId : participant?.cardTwoId;

								if (!rank || !suit || !id) return;
								const { path, sprite } = getCardResPath(rank, suit);
								cardNode.getComponent(CardViewComp).onAdded(player.id, id);

								flipCardToNode(cardNode, 0.5 + index / 2, async () => {
									await loadResSpriteAtlasToNode(cardNode, path, sprite);
								});
							});
						}
					}
				}
			}
		}
	}

	clearCards() {
		if (!this.cards?.length) return;
		for (const card of this.cards) {
			if (!card?.children?.length) continue;
			for (const child of card.children) {
				child.destroy();
			}
		}
	}

	dealCard() {
		this.clearCards();
		this.cards?.map(async (card: Node, index: number) => {
			if (card.getChildByName("card")?.active) return;
			const nodePos: Vec3 = getNodePosition(this.node, card);
			const cardNode = await smc.match.createEmptyCard();

			cardNode.setPosition(v3(500, -300, 0));
			this.node?.addChild(cardNode);

			tweenCardToNode(cardNode, nodePos, 0.5 + index / 2, () => {
				cardNode.removeFromParent();
				cardNode
					.getComponent(UITransform)
					.setContentSize(new Size(card.w, card.h));

				cardNode.position = v3(0, 0, 0);
				card.addChild(cardNode);
			});
		});
	}

	handleLeaveTable(event: string, data: ILeaveTableData) {
		if (data.playerId !== this.data?.id) return;
		this.reset();
	}

	handleChangeTurn(event: string, data: IChangeTurnData) {
		if (this.turn) {
			this.turn.active = false;
			this.turn.active = this.data?.id === data.playerId;
		}

		this.updateCard(data);
		this.checkTurn();
		this.checkStatus(data);
	}

	updateCard(data: IChangeTurnData) {
		const participant = data.matchData.participants.find(
			(item) => item.playerId === this.data?.id,
		) as IParticipant;
		if (!participant) return;
		if (data.matchData.winners?.length > 0 && !participant?.isFolded) {
			oops.audio.playMusic("audios/sound_open");
			this.cards?.map((card: Node, index: number) => {
				if (!card.getChildByName("card")) return;

				const cardNode = card.getChildByName("card");
				const rank =
					index === 0 ? participant?.cardOne?.rank : participant?.cardTwo?.rank;
				const suit =
					index === 0 ? participant?.cardOne?.suit : participant?.cardTwo?.suit;
				const id =
					index === 0 ? participant?.cardOneId : participant?.cardTwoId;
				if (!rank || !suit || !id) return;
				const { path, sprite } = getCardResPath(rank, suit);
				cardNode.getComponent(CardViewComp).onAdded(this.data?.id, id);

				flipCardToNode(cardNode, 0.5 + index / 2, async () => {
					await loadResSpriteAtlasToNode(cardNode, path, sprite);
				});
			});
		}
	}

	updateSlind(data: IMathStartedData) {
		this.slind.active = false;
		const match = data.match as IMatch;
		const participants = data.match?.participants as IParticipant[];
		if (!match || !participants.length || !this.data) return;

		if (participants.length > 2 && match.buttonId === this.data.id) {
			this.slind.getComponent(Sprite).spriteFrame = this.slind
				.getComponent(Sprite)
				.spriteAtlas?.getSpriteFrame("sl");
			this.slind.active = true;
		}

		if (match.smallBlindId === this.data.id) {
			this.slind.getComponent(Sprite).spriteFrame = this.slind
				.getComponent(Sprite)
				.spriteAtlas?.getSpriteFrame("sb");
			this.slind.active = true;
		}

		if (match.bigBlindId === this.data.id) {
			this.slind.getComponent(Sprite).spriteFrame = this.slind
				.getComponent(Sprite)
				.spriteAtlas?.getSpriteFrame("bb");
			this.slind.active = true;
		}
	}

	checkFold(data: IUpdatePlayerData) {
		const participant = data.match?.participants.find(
			(item) => item.playerId === this.data?.id,
		) as IParticipant;
		if (participant && this.fold) {
			this.fold.active = participant.isFolded;
		}
	}

	checkWait(data: IUpdatePlayerData) {
		const participant = data.match?.participants.find(
			(item) => item.playerId === this.data?.id,
		) as IParticipant;
		if (!participant && !data.match?.table?.handOver) {
			this.wait.active = true;
		} else {
			this.wait.active = false;
		}
	}

	checkTurn() {
		if (this.turn.active) {
			const layout = this.node.getChildByName("Layout") as Node;
			if (layout) {
				layout.getComponent(Sprite).spriteFrame = layout
					.getComponent(Sprite)
					.spriteAtlas?.getSpriteFrame("player_bg_turn");
			}
		} else {
			const layout = this.node.getChildByName("Layout") as Node;
			if (layout) {
				layout.getComponent(Sprite).spriteFrame = layout
					.getComponent(Sprite)
					.spriteAtlas?.getSpriteFrame("player_bg");
			}
		}
	}

	checkStatus(data: IChangeTurnData) {
		const isHaveWinner = data.matchData.winners?.length > 0;
		if (!isHaveWinner && !this.turn.active) {
			const participant = data.matchData?.participants.find(
				(item) => item.playerId === this.data?.id,
			) as IParticipant;

			if (!participant || !participant.lastAction) {
				this.status.active = false;
				return;
			}

			if (participant && this.status) {
				this.status.active = true;
				this.status
					.getComponent(StatusViewComp)
					.onAdded(participant.bet, participant.lastAction);
			} else {
				this.status.active = false;
			}
		} else {
			this.status.active = false;
		}
	}

	checkWinner(data: IUpdatePlayerData) {
		if (data.match.winners?.length > 0 && this.winHat) {
			const winner = data.match.winners.find(
				(item) => item.id === this.data?.id,
			);
			this.winHat.active = !!winner;
		}
	}

	onDestroy(): void {
		oops.message.off(PlayerEvent.LEAVE_TABLE, this.handleLeaveTable, this);
		oops.message.off(PlayerEvent.MATCH_STARTED, this.handleMatchStarted, this);
		oops.message.off(PlayerEvent.CHANGE_TURN, this.handleChangeTurn, this);
		oops.message.off(
			PlayerEvent.PLAYERS_UPDATED,
			this.handlePlayersUpdated,
			this,
		);
	}

	reset() {
		this.node.destroy();
	}
}
