import { format } from "db://assets/libs/fommater/formatCurrency";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";

@ecs.register("AccountModel")
export class AccountModelComp extends ecs.Comp {
	vm: AccountVM = new AccountVM();

	get data(): IUser | null {
		return this.vm.data;
	}

	set data(value: IUser | null) {
		this.vm.data = value;
	}

	get balance(): string {
		return this.vm.balance;
	}

	set balance(value: string) {
		this.vm.balance = value;
	}

	vmAdd() {
		VM.add(this.vm, "Account");
	}

	vmRemove() {
		this.vm.reset();
		VM.remove("Account");
	}

	reset() {
		this.vmRemove();
	}
}

class AccountVM {
	data: IUser | null = null;
	balance = "0";

	get name(): string {
		return this.data?.name || "";
	}

	get id(): string {
		return this.data?.id || "";
	}

	reset() {
		this.data = null;
		this.balance = "0";
	}
}
