import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { GameEvent } from "../common/config/GameEvent";
import { AccountModelComp } from "./model/AccountModelComp";
import { AccountNetDataComp } from "./bll/AccountNetData";
import type { HttpReturn } from "db://oops-framework/libs/network/HttpRequest";
import { UIID } from "../common/config/GameUIConfig";
import { smc } from "../common/ecs/SingletonModuleComp";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";
import { format } from "db://assets/libs/fommater/formatCurrency";

@ecs.register("Account")
export class Account extends ecs.Entity {
	AccountModel!: AccountModelComp;
	AccountNetData!: AccountNetDataComp;
	protected init() {
		this.addComponents<ecs.Comp>(AccountModelComp);
		this.add(AccountNetDataComp);
	}

	async login(username: string, password: string) {
		try {
			oops.gui.waitOpen();
			const res = await fetch(`${oops.http.server}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			const data: HttpReturn = await res.json();
			if (data.status) {
				throw new Error(data.message);
			}

			VM.setValue("Account.data", data.user);
			VM.setValue("Account.balance", format(data.user.chipsAmount, true));
			oops.storage.set("userId", data.user.id);

			oops.gui.remove(UIID.Login, true);
			await oops.gui.openAsync(UIID.Layout);
			await oops.gui.openAsync(UIID.Home);
		} catch (error) {
			oops.gui.toast(`${error}`);
		} finally {
			oops.gui.waitClose();
		}
	}

	async register(
		username: string,
		password: string,
		name: string,
		email: string,
	) {
		try {
			oops.gui.waitOpen();

			const res = await fetch(`${oops.http.server}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username,
					password,
					name,
					email,
					external: false,
				}),
			});

			const data: HttpReturn = await res.json();
			if (data.status) {
				throw new Error(data.message);
			}

			oops.gui.remove(UIID.Register, true);

			VM.setValue("Account.data", data.user);
			VM.setValue("Account.balance", format(data.user.chipsAmount, true));
			oops.storage.set("userId", data.user.id);

			await oops.gui.openAsync(UIID.Layout);
		} catch (error) {
			oops.gui.toast(`${error}`);
		} finally {
			oops.gui.waitClose();
		}
	}

	async logout() {
		try {
			oops.gui.waitOpen();
			const res = await fetch(`${oops.http.server}/auth/logout`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: VM.getValue("Account.data.id"),
				}),
			});
			const data: HttpReturn = await res.json();
			if (data.status) {
				throw new Error(data.message);
			}

			oops.storage.remove("userId");
			oops.message.dispatchEvent(GameEvent.CLOSE_DROPDOWN);

			oops.gui.clear();
			oops.gui.open(UIID.Background);
			await oops.gui.openAsync(UIID.Login);
		} catch (error) {
			oops.gui.toast(`${error}`);
		} finally {
			oops.gui.waitClose();
		}
	}

	async getUserInfo(userId: string): Promise<IUser> {
		try {
			const res = await fetch(`${oops.http.server}/users/${userId}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data: HttpReturn = await res.json();
			if (data.status) {
				throw new Error(data.message);
			}

			return data as unknown as IUser;
		} catch (error) {
			throw new Error(error);
		}
	}
}
