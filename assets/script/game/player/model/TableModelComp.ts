import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";

@ecs.register("TableModel")
export class TableModelComp extends ecs.Comp {
	vm: TableMV = new TableMV();

	get data() {
		return this.vm.data;
	}

	set data(value: ITableData[] | null) {
		this.vm.data = value;
	}

	get pageCount() {
		return this.vm.pageCount;
	}

	set pageCount(value: number) {
		this.vm.pageCount = value;
	}

	vmAdd() {
		VM.add(this.vm, "Table");
	}

	vmRemove() {
		this.vm.reset();
		VM.remove("Table");
	}

	reset() {
		this.vmRemove();
	}
}

class TableMV {
	data: ITableData[] | null = null;

	pageCount = 0;

	reset() {
		this.data = null;
		this.pageCount = 0;
	}
}
