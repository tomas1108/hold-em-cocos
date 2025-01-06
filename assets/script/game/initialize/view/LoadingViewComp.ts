import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCVMParentComp } from "db://oops-framework/module/common/CCVMParentComp";
import { UIID } from "../../common/config/GameUIConfig";
import { sys } from "cc";
import { GameEvent } from "../../common/config/GameEvent";
import { smc } from "../../common/ecs/SingletonModuleComp";
import { ModuleUtil } from "db://oops-framework/module/common/ModuleUtil";
import { BackgroundViewComp } from "./BackgroundViewComp";
import { LayoutViewComp } from "./LayoutViewComp";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";
import { HomeViewComp } from "./HomeViewComp";
import { format } from "db://assets/libs/fommater/formatCurrency";

const { ccclass, property } = _decorator;

@ccclass("LoadingViewComp")
@ecs.register("LoadingView", false)
export class LoadingViewComp extends CCVMParentComp {
	data: ILoadingData = {
		finished: 0,
		total: 0,
		progress: "0",
		prompt: "",
	};

	private progress = 0;

	start() {
		if (!sys.isNative) {
			this.enter();
		}
	}

	reset(): void {}

	enter(): void {
		this.loadRes();
	}

	private async loadRes() {
		this.data.progress = "0";
		await this.loadCustom();
		await this.loadGameRes();
		await this.loadGameBundle();
		await this.loadGameAudio();
		await this.loadTextures();
	}

	private async loadCustom() {
		this.data.prompt = oops.language.getLangByID("로드 중...");
	}

	private loadGameBundle() {
		this.data.prompt = oops.language.getLangByID("로드 중...");
		oops.res.load("game", this.onProgressCallback.bind(this));
	}

	private loadGameRes() {
		this.data.prompt = oops.language.getLangByID("로드 중...");
		oops.res.loadDir("game", this.onProgressCallback.bind(this));
	}

	private loadGameAudio() {
		this.data.prompt = oops.language.getLangByID("로드 중...");
		oops.res.loadDir("audios", this.onProgressCallback.bind(this));
	}

	private loadTextures() {
		this.data.prompt = oops.language.getLangByID("로드 중...");
		oops.res.loadDir(
			"textures",
			this.onProgressCallback.bind(this),
			this.onCompleteCallback.bind(this),
		);
	}

	private onProgressCallback(finished: number, total: number) {
		this.data.finished = finished;
		this.data.total = total;

		const progress = finished / total;

		if (progress > this.progress) {
			this.progress = progress;
			this.data.progress = (progress * 100).toFixed(2);
		}
	}

	private async onCompleteCallback() {
		this.data.prompt = oops.language.getLangByID("로드 중...");
		ModuleUtil.addViewUi(this.ent, BackgroundViewComp, UIID.Background);

		const userId = oops.storage.get("userId");
		if (userId) {
			try {
				oops.gui.waitOpen();
				const data = await smc.account.getUserInfo(userId);
				if (!data) throw new Error("Account not found");
				VM.setValue("Account.data", data);
				VM.setValue("Account.balance", format(data.chipsAmount, true));
				ModuleUtil.addViewUi(this.ent, LayoutViewComp, UIID.Layout);
				ModuleUtil.addViewUi(this.ent, HomeViewComp, UIID.Home);

				return;
			} catch (error) {
				oops.storage.remove("userId");
				console.log(error);
			} finally {
				oops.gui.waitClose();
			}
		}

		await oops.gui.openAsync(UIID.Login);
	}
}
