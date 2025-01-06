import { ecs } from "db://oops-framework/libs/ecs/ECS";
import type { Player } from "../Player";

@ecs.register("PlayerInit")
export class PlayerInitComp extends ecs.Comp {
	reset() {}
}

@ecs.register("Player")
export class PlayerInitSystem
	extends ecs.ComblockSystem
	implements ecs.IEntityEnterSystem
{
	filter(): ecs.IMatcher {
		return ecs.allOf(PlayerInitComp);
	}

	entityEnter(e: Player): void {
		const rm = e.RoomModel;
		rm.vmAdd();

		const tm = e.TableModel;
		tm.vmAdd();

		e.remove(PlayerInitComp);
	}
}
