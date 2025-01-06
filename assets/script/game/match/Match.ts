import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { MatchModelComp } from "./model/MatchModelComp";
import { oops } from "db://oops-framework/core/Oops";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";
import { UIID } from "../common/config/GameUIConfig";
import { smc } from "../common/ecs/SingletonModuleComp";
import { MatchInitComp } from "./bll/matchInit";
import { GameEvent } from "../common/config/GameEvent";
import type { MatchViewComp } from "./view/MathViewComp";
import type { PlayerViewComp } from "./view/PlayerViewComp";
import type { ToolsViewComp } from "./view/ToolsViewComp";
import { RebuyModelComp } from "./model/RebuyModelComp";
import { ViewUtil } from "db://oops-framework/core/utils/ViewUtil";
import type { Node } from "cc";
import { v3 } from "cc";
import { format } from "db://assets/libs/fommater/formatCurrency";
import { TableEvent } from "../player/TableEvent";
import { PlayerEvent } from "../player/PlayerEvent";

const EmptyCard: string = "gui/prefab/card";

@ecs.register("Match")
export class Match extends ecs.Entity {
	MatchModel!: MatchModelComp;
	RebuyModel!: RebuyModelComp;

	MatchView!: MatchViewComp;
	PlayerView!: PlayerViewComp;
	ToolsView!: ToolsViewComp;

	protected init() {
		this.addComponents<ecs.Comp>(MatchModelComp, RebuyModelComp);
		this.add(MatchInitComp);
	}

	async exitMatch() {
		const userData = VM.getValue("Account.data");
		const tableData = VM.getValue("Match.table");
		const playerData = VM.getValue("Match.player");

		try {
			oops.gui.waitOpen();

			if (!userData || !tableData || !playerData) {
				return;
			}

			const table = await smc.player.getTable(tableData.id);
			if (!table) {
				oops.gui.toast("Success: Ширээнээс гарахад алдаа гарлаа");
				return;
			}

			const currentPlayer = table.players?.find(
				(item: IPlayerTableData) => item.userId === userData.id,
			);
			if (!currentPlayer) {
				oops.gui.toast("Success: Ширээнээс гарахад алдаа гарлаа");
				return;
			}

			await smc.player.deletePlayer(tableData.id, playerData.id);
			oops.message.dispatchEvent(GameEvent.EXIT_GAME);
		} catch (error) {
			oops.gui.toast(`${error}`);
		} finally {
			oops.gui.waitClose();
			oops.gui.remove(UIID.Match, true);
			oops.gui.openAsync(UIID.Table, tableData?.roomId);
		}
	}

	async loadPlayers(): Promise<IPlayerTableData[]> {
		const tableData = VM.getValue("Match.table");
		try {
			oops.gui.waitOpen();
			const response = await fetch(
				`${oops.http.server}/players/table/${tableData.id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			const data = await response.json();
			if (data.status) {
				throw new Error(data.message);
			}

			const dataUser = data.find(
				(item: IPlayerTableData) =>
					item.userId === VM.getValue("Account.data.id"),
			);

			if (dataUser) {
				VM.setValue("Account.balance", format(dataUser.user.chipsAmount, true));
			}

			oops.message.dispatchEvent(GameEvent.UPDATE_PLAYER_LIST, data);
			return data;
		} catch (error) {
			oops.gui.toast(`${error}`);
		} finally {
			oops.gui.waitClose();
		}
	}

	async createEmptyCard(): Promise<Node> {
		const node = await ViewUtil.createPrefabNodeAsync(EmptyCard, "bundle");
		return node;
	}

	getLastBetParticipant() {
		const player = VM.getValue("Match.player");
		const players = VM.getValue("Match.players");
		const match = VM.getValue("Match.match");
		if (!match || !players.length || !player) return null;

		let currentPlayerIndex = 0;
		currentPlayerIndex = players.findIndex((item) => item.id === player.id);

		if (currentPlayerIndex === -1) {
			return null;
		}
		const lastPlayerIndex =
			currentPlayerIndex - 1 < 0 ? players.length - 1 : currentPlayerIndex - 1;

		const lastBetParticipant = match?.participants.find(
			(item) => item.playerId === players[lastPlayerIndex].id,
		);

		if (!lastBetParticipant) return null;
		return lastBetParticipant;
	}

	destroy(): void {
		super.destroy();
	}
}
