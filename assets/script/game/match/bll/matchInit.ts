import { ecs } from "db://oops-framework/libs/ecs/ECS";
import type { Match } from "../Match";

@ecs.register("MatchInit")
export class MatchInitComp extends ecs.Comp {
	reset() {}
}

@ecs.register("Match")
export class MatchInitSystem
	extends ecs.ComblockSystem
	implements ecs.IEntityEnterSystem
{
	filter(): ecs.IMatcher {
		return ecs.allOf(MatchInitComp);
	}

	entityEnter(e: Match): void {
		const mm = e.MatchModel;
		mm.vmAdd();

		const rbm = e.RebuyModel;
		rbm.vmAdd();

		e.remove(MatchInitComp);
	}
}
