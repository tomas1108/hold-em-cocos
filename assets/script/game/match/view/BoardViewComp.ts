import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { PlayerEvent } from "../../player/PlayerEvent";
import { Node } from "cc";
import type { Vec3 } from "cc";
import { getNodePosition } from "../../../PositionUtils";
import { smc } from "../../common/ecs/SingletonModuleComp";
import { v3 } from "cc";
import { getCardResPath, tweenCardToNode } from "../../../CardUtils";
import { UITransform } from "cc";
import { Size } from "cc";
import { CCVMParentComp } from "db://oops-framework/module/common/CCVMParentComp";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";
import { CardViewComp } from "./CardViewComp";
import { loadResSpriteAtlasToNode } from "../../../SpriteHelper";
import { TableEvent } from "../../player/TableEvent";

const { ccclass, property } = _decorator;

@ccclass("BoardViewComp")
@ecs.register("BoardView", false)
export class BoardViewComp extends CCVMParentComp {
	@property(Node)
	cards: Node[] = [];

	boardCards: Node[] = [];

	data: Partial<IMatch> = {
		pot: 0,
		callAmount: 0,
	};

	start() {
		oops.message.on(TableEvent.LEAVE_TABLE, this.handleLeaveTable, this);
		oops.message.on(PlayerEvent.MATCH_STARTED, this.handleMatchStarted, this);
		oops.message.on(PlayerEvent.CHANGE_TURN, this.handleChangeTurn, this);
		oops.message.on(
			PlayerEvent.PLAYERS_UPDATED,
			this.handlePlayersUpdated,
			this,
		);
	}

	handleLeaveTable(event: string, data: ILeaveTableData) {
		if (VM.getValue("Match.players").length <= 1) {
			this.clearCards();
		}
	}

	handleMatchStarted(event: string, data: IMathStartedData) {
		this.clearCards();
		this.dealCard();
		this.updateView(data.match);
	}

	handlePlayersUpdated(event: string, data: IUpdatePlayerData) {
		this.updateView(data.match);

		const participant = data.match?.participants.find(
			(item) => item.playerId === VM.getValue("Match.player")?.id,
		) as IParticipant;
		if (!participant) {
			if (!this.boardCards?.length) {
				this.dealCard();
				setTimeout(() => {
					this.dealFlopCard();
				}, 200);
			}
		}
	}

	updateView(data: IMatch) {
		if (!this.data) return;
		this.data.pot = data.pot;
		this.data.callAmount = data.callAmount;
	}

	handleChangeTurn(event: string, data: IChangeTurnData) {
		const match = VM.getValue("Match.match") as IMatch;
		if (data.matchData && match) {
			if (!match.isFlop && data.matchData.isFlop) {
				setTimeout(() => {
					this.dealFlopCard();
				}, 200);
			}

			if (!match.isTurn && data.matchData.isTurn) {
				setTimeout(() => {
					this.dealTurnCard();
				}, 500);
			}

			if (!match.isRiver && data.matchData.isRiver) {
				setTimeout(() => {
					this.dealRiverCard();
				}, 800);
			}
		}
	}

	clearCards() {
		if (!this.boardCards?.length) return;
		for (const card of this.boardCards) {
			if (card?.isValid) {
				card.destroy();
			}
		}
		this.boardCards = [];
	}

	private playSlipSound(times = 3) {
		if (times <= 0) return;
		oops.audio.playMusic("audios/sound_slip_3");
		setTimeout(() => this.playSlipSound(times - 1), 200);
	}

	dealCard() {
		if (this.cards?.length > 0) {
			this.playSlipSound();
			Array.from({ length: 3 }).map(async (_, index) => {
				const boardNode = this.cards[0];
				if (boardNode.getChildByName("card")?.active) return;
				const boardPos: Vec3 = getNodePosition(this.node, boardNode);
				const cardNode = await smc.match.createEmptyCard();

				cardNode.setPosition(v3(500, 0, 0));
				this.node?.addChild(cardNode);
				this.boardCards.push(cardNode);

				tweenCardToNode(
					cardNode,
					v3(boardPos.x + index * 5, boardPos.y, boardPos.z),
					0.1 + index / 2,
					() => {
						cardNode
							.getComponent(UITransform)
							.setContentSize(new Size(boardNode.w, boardNode.h));
					},
				);
			});
		}
	}

	dealFlopCard() {
		oops.audio.playMusic("audios/sound_shuffle");
		this.cards?.map(async (card: Node, index: number) => {
			if (index > 2) return;

			const boardPos: Vec3 = getNodePosition(this.node, card);
			const flopCard = this.boardCards[index];
			const match = VM.getValue("Match.match") as IMatch;

			tweenCardToNode(flopCard, boardPos, 0.2 + index / 2, () => {
				const rank = match.board[index].rank;
				const suit = match.board[index].suit;
				const id = match.board[index].id;
				if (!rank || !suit || !id) return;
				const { path, sprite } = getCardResPath(rank, suit);
				flopCard.getComponent(CardViewComp).onAdded(id);
				loadResSpriteAtlasToNode(flopCard, path, sprite);
				flopCard
					.getComponent(UITransform)
					.setContentSize(new Size(card.w, card.h));
			});
		});
	}

	async dealTurnCard() {
		this.playSlipSound(1);
		const board: Node = this.cards?.[3];
		const boardPos: Vec3 = getNodePosition(this.node, board);
		const turnCard: Node = await smc.match.createEmptyCard();

		turnCard.setPosition(v3(500, 0, 0));
		this.node.addChild(turnCard);
		this.boardCards.push(turnCard);

		const match = VM.getValue("Match.match") as IMatch;
		tweenCardToNode(turnCard, boardPos, 0.5, () => {
			const rank = match.board[3].rank;
			const suit = match.board[3].suit;
			const id = match.board[3].id;
			if (!rank || !suit || !id) return;
			const { path, sprite } = getCardResPath(rank, suit);
			turnCard.getComponent(CardViewComp).onAdded(id);
			loadResSpriteAtlasToNode(turnCard, path, sprite);
			turnCard
				.getComponent(UITransform)
				.setContentSize(new Size(board.w, board.h));
		});
	}

	async dealRiverCard() {
		this.playSlipSound(1);
		const board: Node = this.cards[4];
		const boardPos: Vec3 = getNodePosition(this.node, board);
		const turnCard: Node = await smc.match.createEmptyCard();

		turnCard.setPosition(v3(500, 0, 0));
		this.node.addChild(turnCard);
		this.boardCards.push(turnCard);

		const match = VM.getValue("Match.match") as IMatch;
		tweenCardToNode(turnCard, boardPos, 0.6, () => {
			const rank = match.board[4].rank;
			const suit = match.board[4].suit;
			const id = match.board[4].id;
			if (!rank || !suit || !id) return;
			const { path, sprite } = getCardResPath(rank, suit);
			turnCard.getComponent(CardViewComp).onAdded(id);
			loadResSpriteAtlasToNode(turnCard, path, sprite);
			turnCard
				.getComponent(UITransform)
				.setContentSize(new Size(board.w, board.h));
		});
	}

	onDestroy(): void {
		oops.message.off(PlayerEvent.MATCH_STARTED, this.handleMatchStarted, this);
		oops.message.off(PlayerEvent.CHANGE_TURN, this.handleChangeTurn, this);
		oops.message.off(
			PlayerEvent.PLAYERS_UPDATED,
			this.handlePlayersUpdated,
			this,
		);
		oops.message.off(PlayerEvent.LEAVE_TABLE, this.handleLeaveTable, this);
	}

	reset() {
		this.node.destroy();
	}
}
