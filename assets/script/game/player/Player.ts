import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { RoomModelComp } from "./model/RoomModelComp";
import { TableModelComp } from "./model/TableModelComp";
import { PlayerInitComp } from "./bll/PlayerInit";
import { oops } from "db://oops-framework/core/Oops";
import { smc } from "../common/ecs/SingletonModuleComp";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";
import type { HttpReturn } from "db://oops-framework/libs/network/HttpRequest";
import { UIID } from "../common/config/GameUIConfig";
import { TableEvent } from "./TableEvent";
import { GameEvent } from "../common/config/GameEvent";

@ecs.register("Player")
export class Player extends ecs.Entity {
	RoomModel!: RoomModelComp;
	TableModel!: TableModelComp;

	protected init() {
		this.addComponents<ecs.Comp>(RoomModelComp, TableModelComp);
		this.add(PlayerInitComp);
	}

	async loadRooms() {
		try {
			oops.gui.waitOpen();
			const response = await fetch(`${oops.http.server}/rooms`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();
			if (data.status) {
				throw new Error(data.message);
			}

			VM.setValue("Room.data", data.rooms);
			VM.setValue("Room.pageCount", data.pageCount);
		} catch (error) {
			oops.gui.toast(`${error}`);
		} finally {
			oops.gui.waitClose();
		}
	}

	async loadTables(roomId: string) {
		try {
			oops.gui.waitOpen();
			const response = await fetch(
				`${oops.http.server}/tables/active?roomId=${roomId}`,
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

			VM.setValue("Table.data", data.tables);
			VM.setValue("Table.pageCount", data.tables.length);

			oops.gui.remove(UIID.Room, true);
		} catch (error) {
			oops.gui.toast(`${error}`);
		} finally {
			oops.gui.waitClose();
		}
	}

	async joinTable(table: ITableData, buy: string) {
		try {
			oops.gui.waitOpen();
			const socket = smc.network.io;
			const account = VM.getValue("Account.data");
			const res = await fetch(`${oops.http.server}/players`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					buyIn: Number(buy),
					socketId: socket?.id,
					tableId: table.id,
					userId: account.id,
				}),
			});
			const data: HttpReturn = await res.json();
			if (data.status) {
				throw new Error(data.message);
			}

			VM.setValue("Match.player", data);

			oops.gui.remove(UIID.Table_Confirm, true);
			oops.gui.remove(UIID.Table, true);
			await oops.gui.openAsync(UIID.Match, table);

			oops.message.dispatchEvent(GameEvent.ENTER_GAME);
		} catch (error) {
			oops.gui.toast(`${error}`);
		} finally {
			oops.gui.waitClose();
		}
	}

	async getTable(tableId: string): Promise<ITable> {
		try {
			oops.gui.waitOpen();
			const response = await fetch(`${oops.http.server}/tables/${tableId}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();
			if (data.status) {
				throw new Error(data.message);
			}

			return data as unknown as ITable;
		} catch (error) {
			oops.gui.toast(`${error}`);
		} finally {
			oops.gui.waitClose();
		}
	}

	async deletePlayer(tableId: string, playerId: string) {
		try {
			oops.gui.waitOpen();
			await fetch(
				`${oops.http.server}/players/${playerId}?tableId=${tableId}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						tableId,
					}),
				},
			);
		} catch (error) {
			oops.gui.toast(`${error}`);
		} finally {
			oops.gui.waitClose();
		}
	}
}
