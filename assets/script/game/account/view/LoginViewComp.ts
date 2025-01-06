import { EditBox } from "cc";
import type { EventTouch } from "cc";
import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { UIID } from "../../common/config/GameUIConfig";
import { smc } from "../../common/ecs/SingletonModuleComp";

const { ccclass, property } = _decorator;

@ccclass("LoginViewComp")
@ecs.register("LoginView", false)
export class LoginViewComp extends CCComp {
	@property(EditBox)
	username: EditBox | null = null;

	@property(EditBox)
	password: EditBox | null = null;

	private btn_register(event: EventTouch) {
		oops.gui.remove(UIID.Login, true);
		oops.gui.openAsync(UIID.Register);
		event.propagationStopped = true;
	}

	private async btn_login(event: EventTouch) {
		const account = smc.account;
		await account.login(this.username.string, this.password.string);
		event.propagationStopped = true;
	}

	reset() {
		this.node.destroy();
	}
}
