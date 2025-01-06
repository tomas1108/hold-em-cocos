import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { Account } from "../account/Account";
import { InitResComp } from "./bll/InitRes";
import { Player } from "../player/Player";
import { Match } from "../match/Match";

@ecs.register("Initialize")
export class Initialize extends ecs.Entity {
	account: Account;
	player: Player;
	match: Match;
	protected init() {
		this.account = ecs.getEntity<Account>(Account);
		this.addChild(this.account);

		this.player = ecs.getEntity<Player>(Player);
		this.addChild(this.player);

		this.match = ecs.getEntity<Match>(Match);
		this.addChild(this.match);

		this.add(InitResComp);
	}
}
