import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { PlayerEvent, RaiseType } from "../../player/PlayerEvent";
import { ViewUtil } from "db://oops-framework/core/utils/ViewUtil";
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
import { Prefab } from "cc";
import { v3 } from "cc";
import { CardViewComp } from "./CardViewComp";
import { loadResSpriteAtlasToNode } from "../../../SpriteHelper";
import { CCVMParentComp } from "db://oops-framework/module/common/CCVMParentComp";
import { TableEvent } from "../../player/TableEvent";
import type { Socket } from "socket.io-client/build/esm/socket";
import type { EventTouch } from "cc";
import { SpinViewComp } from "./SpinViewComp";
import { Sprite } from "cc";
import { WorkerEvent } from "../../../WebWorker";

const { ccclass, property } = _decorator;

@ccclass("ToolsViewComp")
@ecs.register("ToolsView", false)
export class ToolsViewComp extends CCVMParentComp {
	@property(Node)
	cards: Node[] = [];

	@property(Node)
	turn: Node;

	@property(Node)
	slind: Node;

	@property(Node)
	fold: Node;

	@property(Node)
	wait: Node;

	@property(Node)
	btnCall: Node;

	@property(Node)
	btnCheck: Node;

	socket: Socket;
	data: IPlayerData = {
		callSize: 0,
		currentBet: 0,
		currentCallAmount: 0,
		currentPot: 0,
		currentStack: 0,
		half: 0,
		isLastFullType: false,
		isLastHalfType: false,
		lastBet: 0,
		lastBetParticipant: null,
		participant: null,
		max: 0,
		min: 0,
		quarter: 0,
		canNotCall: false,
		canNotCheck: false,
		canFull: false,
		canHalf: false,
		canQuarter: false,
		canRaise: false,
		isShowdown: false,
	};
	foldCount = 0;
	isClicked = false;
	bet = 0;

	isTurn = false;
	turnTimeout: NodeJS.Timeout | null = null;
	turnEndTime = 0;
	_boundBeforeUnload: ((event?: BeforeUnloadEvent) => void) | null = null;

	start() {
		oops.message.on(PlayerEvent.LEAVE_TABLE, this.handleLeaveTable, this);
		oops.message.on(PlayerEvent.MATCH_STARTED, this.handleMatchStarted, this);
		oops.message.on(TableEvent.UPDATE_FOLD, this.onUpdateFold, this);
		oops.message.on(
			TableEvent.PLAYERS_UPDATED,
			this.handlePlayersUpdated,
			this,
		);
		oops.message.on(PlayerEvent.CHANGE_TURN, this.handleChangeTurn, this);

		oops.message.on(WorkerEvent.UPDATE, this.workerUpdate, this);
		const boundBeforeUnload = this.onBeforeUnload.bind(this);
		window.addEventListener("beforeunload", boundBeforeUnload);
		this._boundBeforeUnload = boundBeforeUnload;

		this.socket = smc.network.io;
		this.isClicked = false;
		this.turn
			.getComponent(SpinViewComp)
			.onAdded(VM.getValue("Match.player").id);
	}

	handleLeaveTable(event: string, data: ILeaveTableData) {
		if (VM.getValue("Match.players").length <= 1) {
			this.clearCards();
		}
		if (this.turn) this.turn.active = false;
	}

	handleMatchStarted(event: string, data: IMathStartedData) {
		this.clearCards();
		this.dealCard();

		this.isTurn = VM.getValue("Match.player")?.id === data.playerId;
		this.turn.active = this.isTurn;
		this.isClicked = false;
		this.slind.active = false;

		this.checkTurn();
		this.updateSlind(data);
	}

	handlePlayersUpdated(event: string, data: IUpdatePlayerData) {
		this.updatePlayerData(data);
		this.updateView(data);
		this.checkKick(data);
		this.checkFold(data);
		this.checkWait(data);
	}

	clearCards() {
		if (!this.cards?.length) return;
		for (const card of this.cards) {
			if (!card?.children?.length) continue;
			for (const child of card.children) {
				child.destroy();
			}
		}
		console.log("clearCards", this.cards);
	}

	dealCard() {
		this.clearCards();
		this.cards?.map(async (card: Node, index: number) => {
			if (card.getChildByName("card")?.active) return;
			const nodePos: Vec3 = getNodePosition(this.node, card);
			const cardNode = await smc.match.createEmptyCard();

			cardNode.setPosition(v3(500, 300, 0));
			this.node?.addChild(cardNode);

			tweenCardToNode(cardNode, nodePos, 0.5 + index / 2, () => {
				cardNode.removeFromParent();
				cardNode
					.getComponent(UITransform)
					.setContentSize(new Size(card.w, card.h));

				cardNode.position = v3(0, 0, 0);
				card.addChild(cardNode);
			});
			setTimeout(() => {
				this.openCard();
			}, 1000);
		});
	}

	openCard() {
		oops.audio.playMusic("audios/sound_open");
		const participants = VM.getValue("Match.participants");
		const player = VM.getValue("Match.player");
		const participant = participants.find(
			(item) => item.playerId === player.id,
		) as IParticipant;
		if (!participant) return;
		this.cards?.map((card: Node, index: number) => {
			if (!card.getChildByName("card")) return;

			const cardNode = card.getChildByName("card");
			const rank =
				index === 0 ? participant?.cardOne?.rank : participant?.cardTwo?.rank;
			const suit =
				index === 0 ? participant?.cardOne?.suit : participant?.cardTwo?.suit;
			const id = index === 0 ? participant?.cardOneId : participant?.cardTwoId;
			if (!rank || !suit || !id) return;
			const { path, sprite } = getCardResPath(rank, suit);
			cardNode.getComponent(CardViewComp).onAdded(id);

			flipCardToNode(cardNode, 0.5 + index / 2, async () => {
				await loadResSpriteAtlasToNode(cardNode, path, sprite);
			});
		});
	}

	onUpdateFold(event: string, playerId: string) {
		const player = VM.getValue("Match.player");
		if (player.id !== playerId) return;

		this.foldCount++;
		const participant = VM.getValue("Match.participants").find(
			(item) => item.playerId === player.id,
		) as IParticipant;

		this.socket?.emit(PlayerEvent.FOLD, {
			tableId: VM.getValue("Match.table").id,
			participantId: participant?.id,
		});

		if (this.foldCount >= 2 && !this.isTurn) {
			console.log("Kick player");
			smc.match.exitMatch();
		}
	}

	handleChangeTurn(event: string, data: IChangeTurnData) {
		this.isTurn = VM.getValue("Match.player")?.id === data.playerId;

		this.isClicked = false;
		if (this.turn) {
			this.turn.active = false;
			this.turn.active = this.isTurn;
		}

		this.checkTurn();
	}

	private btn_call(e: EventTouch) {
		if (this.data?.canNotCall || this.data?.isShowdown) return;
		if (!this.canClick(e)) return;

		this.socket?.emit(PlayerEvent.CALL, {
			tableId: VM.getValue("Match.table").id,
			participantId: this.data.participant.id,
		});

		oops.audio.playMusic("audios/call_boy");
	}

	private btn_quarter(e: EventTouch) {
		if (!this.data?.canQuarter || this.data?.isShowdown) return;
		if (!this.canClick(e)) return;

		this.socket?.emit(PlayerEvent.RAISE, {
			tableId: VM.getValue("Match.table").id,
			participantId: this.data.participant.id,
			amount: this.data.quarter + this.data.currentBet,
			type: RaiseType.QUARTER,
		});

		oops.audio.playMusic("audios/quarter_boy");
	}

	private btn_half(e: EventTouch) {
		if (!this.data?.canHalf || this.data?.isShowdown) return;
		if (!this.canClick(e)) return;

		this.socket?.emit(PlayerEvent.RAISE, {
			tableId: VM.getValue("Match.table").id,
			participantId: this.data.participant.id,
			amount: this.data.half + this.data.currentBet,
			type: RaiseType.HALF,
		});

		oops.audio.playMusic("audios/half_boy");
	}

	private btn_full(e: EventTouch) {
		if (!this.data?.canFull || this.data?.isShowdown) return;
		if (!this.canClick(e)) return;

		this.socket?.emit(PlayerEvent.RAISE, {
			tableId: VM.getValue("Match.table").id,
			participantId: this.data.participant.id,
			amount: this.data.currentPot + this.data.currentBet,
			type: RaiseType.FULL,
		});

		oops.audio.playMusic("audios/full_boy");
	}

	private btn_check(e: EventTouch) {
		if (this.data?.canNotCheck || this.data?.isShowdown) return;
		if (!this.canClick(e)) return;

		this.socket?.emit(PlayerEvent.CHECK, {
			tableId: VM.getValue("Match.table").id,
			participantId: this.data.participant.id,
		});
		oops.audio.playMusic("audios/check_boy");
	}

	private btn_raise(e: EventTouch) {
		if (!this.data?.canRaise) return;
		if (!this.canClick(e)) return;

		if (this.bet === 0) this.bet = this.data.min;
		const bet =
			this.bet > this.data.max
				? this.data.max
				: this.bet < this.data.min
					? this.data.min
					: this.bet;
		this.socket?.emit(PlayerEvent.RAISE, {
			tableId: VM.getValue("Match.table").id,
			participantId: this.data.participant.id,
			amount: bet + this.data.currentBet,
			type: RaiseType.RAISE,
		});

		oops.audio.playMusic("audios/raise_boy");
	}

	private btn_fold(e: EventTouch) {
		if (this.data?.isShowdown) return;
		if (!this.canClick(e)) return;

		this.socket?.emit(PlayerEvent.FOLD, {
			tableId: VM.getValue("Match.table").id,
			participantId: this.data.participant.id,
		});
		oops.audio.playMusic("audios/fold_boy");
	}

	private btn_allin(e: EventTouch) {
		if (this.data?.isShowdown) return;
		if (!this.canClick(e)) return;

		this.socket?.emit(PlayerEvent.RAISE, {
			tableId: VM.getValue("Match.table").id,
			participantId: this.data.participant.id,
			amount: this.data.currentStack + this.data.currentBet,
			type: PlayerEvent.ALLIN,
		});

		oops.audio.playMusic("audios/all_boy");
	}

	updateView(data: IUpdatePlayerData) {
		if (!this.data || !this.btnCall || !this.btnCheck) return;
		this.btnCall.active = this.data.canNotCheck;
		this.btnCheck.active = !this.data.canNotCheck;

		const player = data.players.find(
			(item) => item.id === VM.getValue("Match.player").id,
		);
		if (player && this.data) {
			VM.setValue("Match.player.stack", player.stack);
		}
	}

	canClick(e: EventTouch) {
		e.propagationStopped = true;
		const canClick =
			this.data.participant !== null && this.isTurn && !this.isClicked;
		this.isClicked = true;
		if (this.foldCount > 0) this.foldCount = 0;
		return canClick;
	}

	updatePlayerData(data: IUpdatePlayerData) {
		if (!data || !this.data) return;

		const { match, players } = data;
		const player = players.find(
			(item) => item.id === VM.getValue("Match.player").id,
		);
		if (!player) return;

		const participant = match.participants.find(
			(item) => item.playerId === player.id,
		) as IParticipant;
		const lastBetParticipant = smc.match.getLastBetParticipant();

		this.data.participant = participant;
		this.data.currentPot = match?.pot || 0;
		this.data.currentStack = player?.stack || 0;
		this.data.currentBet = participant?.bet || 0;
		this.data.currentCallAmount = match?.callAmount || 0;
		this.data.canNotCall =
			this.data.currentCallAmount === 0 ||
			this.data.currentBet >= this.data.currentCallAmount;
		this.data.canNotCheck =
			this.data.currentCallAmount !== this.data.currentBet &&
			this.data.currentCallAmount > 0;
		this.data.quarter = Math.floor(this.data.currentPot / 4);
		this.data.half = Math.floor(this.data.currentPot / 2);
		this.data.callSize =
			this.data.currentBet < this.data.currentCallAmount &&
			this.data.currentCallAmount <= this.data.currentStack
				? this.data.currentCallAmount - this.data.currentBet
				: this.data.currentStack;
		this.data.lastBet = lastBetParticipant?.bet || 0;
		this.data.isLastHalfType =
			lastBetParticipant?.lastAction === PlayerEvent.HALF;
		this.data.isLastFullType =
			lastBetParticipant?.lastAction === PlayerEvent.FULL;
		this.data.max = Math.min(
			match?.table?.maxBuyIn || 0,
			this.data.currentStack,
		);
		this.data.min = Math.min(
			Math.max(this.data.currentCallAmount || 0, this.data.lastBet) +
				this.data.lastBet,
			this.data.max,
		);
		this.data.canQuarter =
			!this.data.isLastFullType &&
			!this.data.isLastHalfType &&
			this.data.quarter >= this.data.currentCallAmount &&
			this.data.currentStack >= this.data.quarter;
		this.data.canHalf =
			!this.data.isLastFullType &&
			!this.data.isLastHalfType &&
			this.data.half >= this.data.currentCallAmount &&
			this.data.currentStack >= this.data.half;
		this.data.canFull =
			this.data.currentPot >= this.data.currentCallAmount &&
			this.data.currentStack >= this.data.currentPot;
		this.data.canRaise = this.data.currentStack >= this.data.currentCallAmount;
		this.data.isShowdown = match.isShowdown || false;
	}

	checkKick(data: IUpdatePlayerData) {
		const player = data.players.find(
			(item) => item.id === VM.getValue("Match.player").id,
		);

		if (player && this.data) {
			const isNotEnoughStack =
				player &&
				data.match?.minBet &&
				player?.stack - data.match?.minBet * 2 - data.match.table.ante < 0;
			const isStackEmpty = player && player?.stack <= 0;

			const isHaveWinner = (data.match?.winners?.length ?? 0) > 0;
			const canAutoRebuy = VM.getValue("Rebuy.canAutoRebuy");
			const isLeaveNext = VM.getValue("Rebuy.isLeaveNext");
			const canKick =
				(isLeaveNext && isHaveWinner) ||
				(isHaveWinner &&
					canAutoRebuy &&
					(isStackEmpty || isNotEnoughStack || this.foldCount >= 2));

			if (canKick) {
				setTimeout(() => {
					smc.match.exitMatch();
				}, 4000);
			}
		}
	}

	checkFold(data: IUpdatePlayerData) {
		const participant = data.match?.participants.find(
			(item) => item.playerId === VM.getValue("Match.player").id,
		) as IParticipant;
		if (participant && this.fold) {
			this.fold.active = participant.isFolded;
		}
	}

	checkWait(data: IUpdatePlayerData) {
		const participant = data.match?.participants.find(
			(item) => item.playerId === VM.getValue("Match.player")?.id,
		) as IParticipant;
		if (!participant && !data.match?.table?.handOver) {
			this.wait.active = true;
		} else {
			this.wait.active = false;
		}
	}

	checkTurn() {
		if (this.isTurn) {
			setTimeout(() => {
				oops.audio.playMusic("audios/my_turn");
			}, 800);
			const layout = this.node.getChildByName("Layout") as Node;
			if (layout) {
				layout.getComponent(Sprite).spriteFrame = layout
					.getComponent(Sprite)
					.spriteAtlas?.getSpriteFrame("bg_tool_turn");
			}
		} else {
			const layout = this.node.getChildByName("Layout") as Node;
			if (layout) {
				layout.getComponent(Sprite).spriteFrame = layout
					.getComponent(Sprite)
					.spriteAtlas?.getSpriteFrame("bg_tool");
			}
		}
	}

	updateSlind(data: IMathStartedData) {
		this.slind.active = false;
		const player = VM.getValue("Match.player") as IPlayerTableData;
		const match = data.match as IMatch;
		const participants = data.match?.participants as IParticipant[];
		if (!match || !participants.length || !player) return;

		if (participants.length > 2 && match.buttonId === player.id) {
			this.slind.getComponent(Sprite).spriteFrame = this.slind
				.getComponent(Sprite)
				.spriteAtlas?.getSpriteFrame("sl");
			this.slind.active = true;
		}

		if (match.smallBlindId === player.id) {
			this.slind.getComponent(Sprite).spriteFrame = this.slind
				.getComponent(Sprite)
				.spriteAtlas?.getSpriteFrame("sb");
			this.slind.active = true;
		}

		if (match.bigBlindId === player.id) {
			this.slind.getComponent(Sprite).spriteFrame = this.slind
				.getComponent(Sprite)
				.spriteAtlas?.getSpriteFrame("bb");
			this.slind.active = true;
		}
	}

	private workerUpdate(event: string, deltaTime: number) {
		if (!this.turn) return;
		if (this.isTurn && !this.turnTimeout) {
			const turnDuration = 9000;
			this.turnEndTime = Date.now() + turnDuration;
			this.turnTimeout = setTimeout(() => {
				this.onUpdateFold("fold", VM.getValue("Match.player").id);
				this.turnTimeout = null;
				this.turnEndTime = 0;
			}, turnDuration);

			const timeLeft = Math.max(
				0,
				Math.ceil((this.turnEndTime - Date.now()) / 1000),
			);
			this.turn.getComponent(SpinViewComp).setCountdownTime(timeLeft);
		} else if (!this.isTurn && this.turnTimeout) {
			clearTimeout(this.turnTimeout);
			this.turnTimeout = null;
			this.turnEndTime = 0;
		} else if (this.isTurn && this.turnTimeout) {
			const timeLeft = Math.max(
				0,
				Math.ceil((this.turnEndTime - Date.now()) / 1000),
			);
			this.turn.getComponent(SpinViewComp).setCountdownTime(timeLeft);
		}
	}

	onBeforeUnload(event?: BeforeUnloadEvent) {
		const message = "Are you sure you want to leave?";
		if (event) {
			event.preventDefault();
		}

		if (confirm(message)) {
			this.socket?.emit(TableEvent.TABLE_LEFT, {
				tableId: VM.getValue("Match.table").id,
				playerId: VM.getValue("Match.player").id,
			});
			smc.match.exitMatch();
		}

		if (event) {
			return message;
		}
	}

	onDestroy(): void {
		oops.message.off(PlayerEvent.MATCH_STARTED, this.handleMatchStarted, this);
		oops.message.off(TableEvent.UPDATE_FOLD, this.onUpdateFold, this);
		oops.message.off(
			TableEvent.PLAYERS_UPDATED,
			this.handlePlayersUpdated,
			this,
		);
		oops.message.off(PlayerEvent.CHANGE_TURN, this.handleChangeTurn, this);
	}

	reset() {
		this.node.destroy();
	}
}
