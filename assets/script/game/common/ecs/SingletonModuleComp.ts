import { ecs } from "db://oops-framework/libs/ecs/ECS";
import type { Initialize } from "../../initialize/Initialize";
import type { Account } from "../../account/Account";
import type { Player } from "../../player/Player";
import type { NetworkManager } from "../../../NetworkManager";
import type { WebWorker } from "../../../WebWorker";
import type { Match } from "../../match/Match";

@ecs.register("SingletonModule")
export class SingletonModuleComp extends ecs.Comp {
	initialize: Initialize;
	network: NetworkManager;
	worker: WebWorker;

	get account(): Account {
		return this.initialize.account;
	}

	get player(): Player {
		return this.initialize.player;
	}

	get match(): Match {
		return this.initialize.match;
	}

	get networkManager(): NetworkManager {
		return this.network;
	}

	get webWorker(): WebWorker {
		return this.worker;
	}

	reset() {}
}

export const smc: SingletonModuleComp = ecs.getSingleton(SingletonModuleComp);
