import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";

@ecs.register("RebuyModel")
export class RebuyModelComp extends ecs.Comp {
	vm: MatchVM = new MatchVM();

	get canAutoRebuy() {
		return this.vm.canAutoRebuy;
	}

	get isAutoRebuy() {
		return this.vm.isAutoRebuy;
	}

	get autoRebuyAmount() {
		return this.vm.autoRebuyAmount;
	}

	get isLeaveNext() {
		return this.vm.isLeaveNext;
	}

	setCanAutoRebuy(canAutoRebuy: boolean) {
		this.vm.canAutoRebuy = canAutoRebuy;
	}

	setIsAutoRebuy(isAutoRebuy: boolean) {
		this.vm.isAutoRebuy = isAutoRebuy;
	}

	setAutoRebuyAmount(autoRebuyAmount: number) {
		this.vm.autoRebuyAmount = autoRebuyAmount;
	}

	vmAdd() {
		VM.add(this.vm, "Rebuy");
	}

	vmRemove() {
		this.vm.reset();
		VM.remove("Rebuy");
	}

	reset() {
		this.vmRemove();
	}
}

class MatchVM {
	canAutoRebuy = false;
	isAutoRebuy = false;
	autoRebuyAmount = 0;
	isLeaveNext = false;

	reset() {
		this.canAutoRebuy = false;
		this.isAutoRebuy = false;
		this.autoRebuyAmount = 0;
		this.isLeaveNext = false;
	}
}
