import { _decorator, profiler } from "cc";
import { DEBUG } from "cc/env";
import { oops } from "db://oops-framework/core/Oops";
import { Root } from "db://oops-framework/core/Root";
import { ecs } from "db://oops-framework/libs/ecs/ECS";

import { smc } from "./game/common/ecs/SingletonModuleComp";
import { Initialize } from "./game/initialize/Initialize";
import { UIConfigData } from "./game/common/config/GameUIConfig";
import { NetworkManager } from "./NetworkManager";
import { WebWorker } from "./WebWorker";

const { ccclass, property } = _decorator;

@ccclass("Main")
export class Main extends Root {
	start() {
		if (DEBUG) profiler.showStats();
	}

	protected run() {
		smc.initialize = ecs.getEntity<Initialize>(Initialize);
		smc.network = ecs.getEntity<NetworkManager>(NetworkManager);
		smc.worker = ecs.getEntity<WebWorker>(WebWorker);
	}

	protected initGui() {
		oops.gui.init(UIConfigData);
		oops.audio.volumeMusic = 0.5;
		oops.audio.playMusicLoop("audios/sound_home");
	}
}
