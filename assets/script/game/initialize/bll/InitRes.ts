import { oops } from "db://oops-framework/core/Oops";
import {
	AsyncQueue,
	type NextFunction,
} from "db://oops-framework/libs/collection/AsyncQueue";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { ModuleUtil } from "db://oops-framework/module/common/ModuleUtil";
import { UIID } from "../../common/config/GameUIConfig";
import type { Initialize } from "../Initialize";
import { LoadingViewComp } from "../view/LoadingViewComp";

@ecs.register("InitRes")
export class InitResComp extends ecs.Comp {
	reset() {}
}

@ecs.register("Initialize")
export class InitResSystem
	extends ecs.ComblockSystem
	implements ecs.IEntityEnterSystem
{
	filter(): ecs.IMatcher {
		return ecs.allOf(InitResComp);
	}

	entityEnter(e: Initialize): void {
		const queue: AsyncQueue = new AsyncQueue();

		this.loadLanguage(queue);
		this.loadCustom(queue);
		this.loadCommon(queue);
		this.onComplete(queue, e);

		queue.play();
	}

	private loadCustom(queue: AsyncQueue) {
		queue.push(async (next: NextFunction) => {
			oops.res.load(`language/font/${oops.language.current}`, next);
		});
	}

	private loadLanguage(queue: AsyncQueue) {
		queue.push((next: NextFunction) => {
			const lan = oops.storage.get("language");
			oops.storage.set("language", lan || "en");
			oops.language.setLanguage(lan, next);
		});
	}

	private loadCommon(queue: AsyncQueue) {
		queue.push((next: NextFunction) => {
			oops.res.loadDir("common", next);
		});
	}

	private onComplete(queue: AsyncQueue, e: Initialize) {
		queue.complete = async () => {
			ModuleUtil.addViewUi(e, LoadingViewComp, UIID.Loading);
			e.remove(InitResComp);
		};
	}
}
