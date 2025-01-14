import { _decorator } from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { smc } from "../../common/ecs/SingletonModuleComp";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";
import { Prefab } from "cc";
import { TableEvent } from "../../player/TableEvent";
import { instantiate } from "cc";
import { PlayerViewComp } from "./PlayerViewComp";
import { Node } from "cc";
import { UITransform } from "cc";
import { Size } from "cc";
import type { Socket } from "socket.io-client";
import { oops } from "db://oops-framework/core/Oops";
import { PlayerEvent } from "../../player/PlayerEvent";
import { format } from "db://assets/libs/fommater/formatCurrency";
import { v3 } from "cc";

const { ccclass, property } = _decorator;

// const PLAYER_POSITIONS = {
// 	1: v3(0, 210, 0),
// 	2: [v3(-140, 210, 0), v3(165, 210, 0)],
// 	3: [v3(-310, 210, 0), v3(10, 210, 0), v3(330, 210, 0)],
// 	4: [v3(-488, 210, 0), v3(-140, 210, 0), v3(165, 210, 0), v3(453, 210, 0)],
// 	5: v3(615, 31, 0),
// 	6: v3(615, -130, 0),
// 	7: v3(-622, -130, 0),
// 	8: v3(620, 24, 0),
// };

const PLAYER_POSITIONS = {
	1: [v3(0, 210, 0)],
	2: [v3(-140, 210, 0), v3(165, 210, 0)],
	3: [v3(-310, 210, 0), v3(10, 210, 0), v3(330, 210, 0)],
	4: [v3(-488, 210, 0), v3(-140, 210, 0), v3(165, 210, 0), v3(453, 210, 0)],
	5: [
		v3(-622, -130, 0),
		v3(-488, 210, 0),
		v3(-140, 210, 0),
		v3(165, 210, 0),
		v3(453, 210, 0),
	],
	6: [
		v3(-622, -130, 0),
		v3(-620, 24, 0),
		v3(-488, 210, 0),
		v3(-140, 210, 0),
		v3(165, 210, 0),
		v3(453, 210, 0),
	],
	7: [
		v3(-622, -130, 0),
		v3(-620, 24, 0),
		v3(-488, 210, 0),
		v3(-140, 210, 0),
		v3(165, 210, 0),
		v3(453, 210, 0),
		v3(615, 31, 0),
	],
	8: [
		v3(-622, -130, 0),
		v3(-620, 24, 0),
		v3(-488, 210, 0),
		v3(-140, 210, 0),
		v3(165, 210, 0),
		v3(453, 210, 0),
		v3(615, 31, 0),
		v3(615, -130, 0),
	],
};

@ccclass("MatchViewComp")
@ecs.register("MatchView", false)
export class MatchViewComp extends CCComp {
	@property(Node)
	playersNode: Node;

	@property(Prefab)
	playerPrefab: Prefab;

	initMatchTimeout: NodeJS.Timeout;
	socket: Socket;

	onAdded(table: ITable) {
		VM.setValue("Match.table", table);
	}

	onLoad(): void {
		this.loadPlayers();
		this.socket = smc.network.io;

		this.socket.on(TableEvent.MATCH_STARTED, (data: IMathStartedData) => {
			console.log("MATCH_STARTED", VM);
			VM.setValue("Match.match", null);
			VM.setValue("Match.participants", []);
			VM.setValue("Match.highlightCards", null);
			VM.setValue("Match.isHandVisible", false);

			const { match } = data;
			if (match) {
				VM.setValue("Match.isShuffle", true);
				VM.setValue("Match.match", match);
				VM.setValue("Match.isNextMatchComing", false);
				VM.setValue("Match.participants", match.participants);

				const players = VM.getValue("Match.players").map((player) => ({
					...player,
					isTurn: player.id === data.playerId,
				}));
				VM.setValue("Match.players", players);
				oops.message.dispatchEvent(TableEvent.MATCH_STARTED, data);
			}
		});

		this.socket.on(TableEvent.TABLE_MESSAGE, (data: ITableMessage) => {
			oops.gui.toast(`Success: ${data.message}`);
			oops.message.dispatchEvent(TableEvent.TABLE_MESSAGE, data);
		});

		this.socket.on(TableEvent.JOIN_TABLE, (data: IJoinTableData) => {
			if (data.tableId !== VM.getValue("Match.table").id) return;

			const players = VM.getValue("Match.players").filter(
				(item) => item.id !== data.player.id,
			);
			VM.setValue("Match.players", [...players, data.player]);

			this.loadPlayerNode(this, data.player);
			this.socket.emit(TableEvent.TABLE_JOINED, {
				tableId: data.tableId,
				player: data.player,
			});

			oops.message.dispatchEvent(TableEvent.JOIN_TABLE, data);
			this.updatePlayersContent(this);
		});

		this.socket.on(TableEvent.LEAVE_TABLE, (data: ILeaveTableData) => {
			const tableData = VM.getValue("Match.table");
			if (tableData?.id !== data.tableId) return;

			const players = VM.getValue("Match.players").filter(
				(item) => item.id !== data.playerId,
			);
			VM.setValue("Match.players", players);

			this.socket.emit(TableEvent.TABLE_LEFT, {
				tableId: data.tableId,
				playerId: data.playerId,
			});
			oops.message.dispatchEvent(TableEvent.LEAVE_TABLE, data);
			this.updatePlayersContent(this);
		});

		this.socket.on(PlayerEvent.CHANGE_TURN, (data: IChangeTurnData) => {
			oops.message.dispatchEvent(PlayerEvent.CHANGE_TURN, data);
			this.changeTurn(this, data);
		});

		this.socket.on(PlayerEvent.PLAYERS_UPDATED, (data: IUpdatePlayerData) => {
			const players = VM.getValue("Match.players").map((player) => ({
				...player,
				isTurn: false,
			}));
			VM.setValue("Match.players", players);
			if (data.match) {
				VM.setValue("Rebuy.canAutoRebuy", true);
				oops.message.dispatchEvent(PlayerEvent.PLAYERS_UPDATED, data);
			}
		});

		this.socket.on(
			PlayerEvent.PARTICIPANTS_UPDATED,
			(data: IParticipantData) => {
				const participants = VM.getValue("Match.participants").map(
					(participant) => {
						if (data.participant.id === participant.id) {
							return data.participant;
						}
						return participant;
					},
				);
				VM.setValue("Match.participants", participants);
				oops.message.dispatchEvent(PlayerEvent.PARTICIPANTS_UPDATED, data);
			},
		);

		this.socket.on(PlayerEvent.REBUY, (data: IRebuyData) => {
			const players = VM.getValue("Match.players").map((player) => {
				if (player.id === data.player.id) {
					return data.player;
				}
				return player;
			});
			VM.setValue("Match.players", players);

			this.socket.emit(PlayerEvent.REBOUGHT, {
				tableId: data.tableId,
				player: data.player,
			});
			oops.message.dispatchEvent(PlayerEvent.REBUY, data);
		});

		this.socket.on(PlayerEvent.HIGHLIGHT_CARDS, (encoding: string) => {
			const decodedString = decodeURIComponent(
				Array.from(atob(encoding))
					.map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
					.join(""),
			);

			const data = JSON.parse(decodedString) as IHighlightResponse;
			if (data) {
				const { playerHighlightSet } = data;
				const players = VM.getValue("Match.players");
				const player = VM.getValue("Match.player");

				if (!player || !players) return;
				VM.setValue("Match.highlightCards", playerHighlightSet);
				oops.message.dispatchEvent(PlayerEvent.HIGHLIGHT_CARDS, data);
			}
		});

		this.socket.on(
			PlayerEvent.NEXT_MATCH_IS_COMING,
			(data: IMathComingData) => {
				const players = VM.getValue("Match.players");
				if (data.isComing) {
					if (players.length <= 1) {
						VM.setValue("Match.isNextMatchComing", false);
						return;
					}
					VM.setValue("Match.isNextMatchComing", true);
				} else {
					VM.setValue("Match.isNextMatchComing", false);
				}
			},
		);

		this.socket.on(
			PlayerEvent.UPDATE_MISSING_PLAYER_STACK,
			(data: IMissingData) => {
				const players = VM.getValue("Match.players").map((player) => {
					if (player.id === data.player.id) {
						return { ...player, stack: data.player.stack };
					}
					return player;
				});
				VM.setValue("Match.players", players);
				oops.message.dispatchEvent(
					PlayerEvent.UPDATE_MISSING_PLAYER_STACK,
					data,
				);
			},
		);
	}

	private async loadPlayers() {
		const players = await smc.match.loadPlayers();
		if (!players) {
			VM.setValue("Match.players", []);
			return;
		}

		VM.setValue("Match.players", players);
		for (const player of players) {
			this.loadPlayerNode(this, player);
		}

		const tableData = VM.getValue("Match.table");
		if (players.length >= tableData.minPlayers) {
			this.initMatch();
		}
	}

	private loadPlayerNode(self: MatchViewComp, player: IPlayerTableData) {
		const user = VM.getValue("Account.data");
		if (player.userId === user.id) {
			VM.setValue("Match.player", player);
			VM.setValue("Account.balance", format(player.user.chipsAmount, true));
			return;
		}

		const playerNode = instantiate(self.playerPrefab);
		playerNode.getComponent(PlayerViewComp).onAdded(player);
		self.playersNode.addChild(playerNode);
		self.updatePlayersContent(self);
	}

	private updatePlayersContent(self: MatchViewComp) {
		const players = VM.getValue("Match.players");
		const player = VM.getValue("Match.player");

		if (!players.length || !player) return;

		const currentPlayerIndex = players.findIndex(
			(item) => item.id === player.id,
		);

		const newSortedPlayers = [
			...players.slice(currentPlayerIndex + 1),
			...players.slice(0, currentPlayerIndex + 1),
		];

		for (let i = 0; i < newSortedPlayers.length - 1; i++) {
			for (const playerNode of self.playersNode.children) {
				if (!playerNode) continue;
				const player = playerNode.getComponent(PlayerViewComp).data;
				if (player) {
					if (player.id === newSortedPlayers[i].id) {
						playerNode.setSiblingIndex(i);
					}
				}
			}
		}

		// for (let i = 0; i < newSortedPlayers.length; i++) {
		// 	if (i === 0 || i >= 4) {
		// 		const node = self.playersNode.children[i];
		// 		if (!node) continue;
		// 		node.setPosition(PLAYER_POSITIONS[i + 1]);
		// 	} else {
		// 		for (let j = 0; j < i + 1; j++) {
		// 			const node = self.playersNode.children[j];
		// 			if (!node) continue;
		// 			node.setPosition(PLAYER_POSITIONS[i + 1][j]);
		// 		}
		// 	}
		// }

		for (let i = 0; i < newSortedPlayers.length - 1; i++) {
			for (let j = 0; j <= i; j++) {
				const node = self.playersNode.children[j];
				if (!node) continue;
				node.setPosition(PLAYER_POSITIONS[i + 1][j]);
			}
		}
	}

	private async exit() {
		await smc.match.exitMatch();
	}

	private initMatch(delay = 6000, timeout = 0) {
		this.initMatchTimeout = setTimeout(() => {
			smc.network.io.emit(TableEvent.START_INIT_MATCH, {
				tableId: VM.getValue("Match.table").id,
				delay: timeout,
			});
		}, delay);
	}

	private changeTurn(self: MatchViewComp, data: IChangeTurnData) {
		const player = VM.getValue("Match.player");

		if (data.matchData && player) {
			const isHaveWinner = data.matchData.winners?.length > 0;
			const players = VM.getValue("Match.players") || [];

			if (data.matchData.isShowdown && !data.matchData.isAllAllIn) {
				if (player.id === players[0]?.id) {
					console.log("initMatch1");
					self.initMatch(3000, 8000);
				}
			}

			const match = VM.getValue("Match.match") as IMatch;
			if (match) {
				if (!data.matchData.isShowdown && isHaveWinner) {
					if (player.id === players[0]?.id) {
						console.log("initMatch2");
						self.initMatch(3000, 8000);
					}
				}

				if (data.matchData.isShowdown && data.matchData.isAllAllIn) {
					if (player.id === players[0]?.id) {
						console.log("initMatch3");
						self.initMatch(3000, 9000);
					}
				}

				if (!isHaveWinner && !data.playerId) {
					console.log("initMatch4");
					this.socket?.emit(PlayerEvent.FOLD, {
						tableId: VM.getValue("Match.table").id,
						participantId:
							match.participants[match.participants.length - 1]?.id,
					});
				}
			}

			if (isHaveWinner) {
				data.matchData.winMessages?.map((item: IWinnerMessage) => {
					oops.gui.toast(`Success: You won ${item.content}`);
				});
			}

			VM.setValue("Match.match", data.matchData);
			VM.setValue("Match.participants", data.matchData.participants);
		}
	}

	onDestroy(): void {
		this.socket.off(TableEvent.JOIN_TABLE);
		this.socket.off(TableEvent.LEAVE_TABLE);
		this.socket.off(TableEvent.MATCH_STARTED);
		this.socket.off(TableEvent.TABLE_MESSAGE);
		this.socket.off(PlayerEvent.UPDATE_MISSING_PLAYER_STACK);
		this.socket.off(PlayerEvent.NEXT_MATCH_IS_COMING);
		this.socket.off(PlayerEvent.PARTICIPANTS_UPDATED);
		this.socket.off(PlayerEvent.PLAYERS_UPDATED);
		this.socket.off(PlayerEvent.REBUY);
		this.socket.off(PlayerEvent.HIGHLIGHT_CARDS);

		if (this.initMatchTimeout) clearTimeout(this.initMatchTimeout);
	}

	resetCards() {}
	reset() {
		this.node.destroy();
	}
}
