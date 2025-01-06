import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";

@ecs.register("MatchModel")
export class MatchModelComp extends ecs.Comp {
	vm: MatchVM = new MatchVM();

	get roomId() {
		return this.vm.roomId;
	}

	set roomId(roomId: string) {
		this.vm.roomId = roomId;
	}

	get table() {
		return this.vm.table;
	}

	set table(table: ITableData) {
		this.vm.table = table;
	}

	get participants() {
		return this.vm.participants;
	}

	set participants(participants: IParticipant[]) {
		this.vm.participants = participants;
	}

	get match() {
		return this.vm.match;
	}

	set match(match: IMatch) {
		this.vm.match = match;
	}

	get highlightCards() {
		return this.vm.highlightCards;
	}

	set highlightCards(highlightCards: ICardData[]) {
		this.vm.highlightCards = highlightCards;
	}

	get players() {
		return this.vm.players;
	}

	set players(players: IPlayerTableData[]) {
		console.log("set players", players);
		this.vm.players = players;
	}

	get player() {
		return this.vm.player;
	}

	set player(player: IPlayerTableData) {
		this.vm.player = player;
	}

	get isShuffle() {
		return this.vm.isShuffle;
	}

	set isShuffle(isShuffle: boolean) {
		this.vm.isShuffle = isShuffle;
	}

	get isNextMatchComing() {
		return this.vm.isNextMatchComing;
	}

	set isNextMatchComing(isNextMatchComing: boolean) {
		this.vm.isNextMatchComing = isNextMatchComing;
	}

	get isHandVisible() {
		return this.vm.isHandVisible;
	}

	set isHandVisible(isHandVisible: boolean) {
		this.vm.isHandVisible = isHandVisible;
	}

	vmAdd() {
		VM.add(this.vm, "Match");
	}

	vmRemove() {
		this.vm.reset();
		VM.remove("Match");
	}

	reset() {
		this.vmRemove();
	}
}

class MatchVM {
	roomId: string | null = null;
	table: ITableData | null = null;
	match: IMatch | null = null;
	participants: IParticipant[] = [];
	players: IPlayerTableData[] = [];
	player: IPlayerTableData | null = null;
	highlightCards: ICardData[] = [];

	isShuffle = false;
	isNextMatchComing = false;
	isHandVisible = false;

	reset() {
		this.table = null;
		this.match = null;
		this.participants = [];
		this.players = [];
		this.highlightCards = [];
		this.player = null;

		this.isShuffle = false;
		this.isNextMatchComing = false;
		this.isHandVisible = false;
	}
}
