import { _decorator, sys } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCVMParentComp } from "db://oops-framework/module/common/CCVMParentComp";
import { UIID } from "../../common/config/GameUIConfig";
import { smc } from "../../common/ecs/SingletonModuleComp";
import { ModuleUtil } from "db://oops-framework/module/common/ModuleUtil";
import { BackgroundViewComp } from "./BackgroundViewComp";
import { LayoutViewComp } from "./LayoutViewComp";
import { HomeViewComp } from "./HomeViewComp";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";
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
			this.handleNavigation(); // Kiểm tra query parameters và điều hướng
		} else {
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
		this.data.prompt = oops.language.getLangByID("Loading...");
	}

	private loadGameBundle() {
		this.data.prompt = oops.language.getLangByID("Loading...");
		oops.res.load("game", this.onProgressCallback.bind(this));
	}

	private loadGameRes() {
		this.data.prompt = oops.language.getLangByID("Loading...");
		oops.res.loadDir("game", this.onProgressCallback.bind(this));
	}

	private loadGameAudio() {
		this.data.prompt = oops.language.getLangByID("Loading...");
		oops.res.loadDir("audios", this.onProgressCallback.bind(this));
	}

	private loadTextures() {
		this.data.prompt = oops.language.getLangByID("Loading...");
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
		this.data.prompt = oops.language.getLangByID("Loading...");
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

	/**
	 * Kiểm tra query parameters từ URL và điều hướng đến Access Page nếu cần.
	 */
	private handleNavigation() {
		
		const params = this.getQueryParams();
		console.log(params);

		


		if (params.encryptedData) {
			oops.gui.openAsync(UIID.Background).then(() => {
				oops.gui.open(UIID.AccessScreen);
			});

			// Truyền params vào AccessScreen nếu cần
			const screenNode = oops.gui.get(UIID.AccessScreen);
			if (screenNode) {
				const accessScreen = screenNode.getComponent("AccessScreen");
				if (accessScreen) {
					accessScreen.setParams(params); // Giả định bạn có hàm setParams
				}
			}
		} else {
			// Nếu không có tham số đặc biệt, tiếp tục với logic thông thường
			this.enter();
		}
	}

	/**
	 * Lấy các query parameters từ URL.
	 */
	private getQueryParams(): Record<string, string> {
		const params: Record<string, string> = {};
		const queryString = window.location.search; // Lấy phần ?encryptedData=...
		const urlParams = new URLSearchParams(queryString);

		urlParams.forEach((value, key) => {
			params[key] = value;
		});

		return params;
	}
}
