import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";

@ecs.register("RoomModel")
export class RoomModelComp extends ecs.Comp {
	vm: RoomMV = new RoomMV();

	get data() {
		return this.vm.data;
	}

	set data(value: IRoom[] | null) {
		this.vm.data = value;
	}

	get pageCount() {
		return this.vm.pageCount;
	}

	set pageCount(value: number) {
		this.vm.pageCount = value;
	}

	vmAdd() {
		VM.add(this.vm, "Room");
	}

	vmRemove() {
		this.vm.reset();
		VM.remove("Room");
	}

	reset() {
		this.vmRemove();
	}
}

class RoomMV {
	data: IRoom[] | null = null;

	pageCount = 0;

	reset() {
		this.data = null;
		this.pageCount = 0;
	}
}
