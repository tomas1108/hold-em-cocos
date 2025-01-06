import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { AccountModelComp } from "../model/AccountModelComp";
import type { Account } from "../Account";
import { oops } from "db://oops-framework/core/Oops";
import { GameEvent } from "../../common/config/GameEvent";
import { smc } from "../../common/ecs/SingletonModuleComp";
import { UIID } from "../../common/config/GameUIConfig";

@ecs.register("AccountNetData")
export class AccountNetDataComp extends ecs.Comp {
	reset() {}
}

@ecs.register("Account")
export class AccountNetDataSystem
	extends ecs.ComblockSystem
	implements ecs.IEntityEnterSystem
{
	filter(): ecs.IMatcher {
		return ecs.allOf(AccountNetDataComp, AccountModelComp);
	}

	async entityEnter(e: Account): Promise<void> {
		const onComplete = {
			target: this,
			callback: (data: IUser) => {
				this.createAccount(e, data);
				oops.message.dispatchEvent(GameEvent.LOGIN_SUCCESS);
			},
		};

		const data = null;
		onComplete.callback(data);
		e.remove(AccountNetDataComp);
	}

	private createAccount(e: Account, data: IUser) {
		const account = e.AccountModel;
		account.vmAdd();
		if (data) {
			account.vm.data = data;
			oops.storage.set("userId", data.id);
		}
	}
}
