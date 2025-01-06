import type { Socket } from "socket.io-client";

declare global {
	interface Window {
		socketIo: Socket;
	}

	interface ILoadingData {
		finished: number;
		total: number;
		progress: string;
		prompt: string;
	}

	interface IDialogType {
		title: string;
		content: string;
		okWord?: string;
		cancelWord?: string;
		okFunc?: () => void;
		cancelFunc?: () => void;
		needCancel?: boolean;
	}

	interface ITableMessage {
		message: string;
		type: "error" | "success" | "info" | "warning";
	}

	interface IRoom {
		id: string;
		name: string;
		createdAt: string;
		updatedAt: string;
		removedAt: string | null;
	}

	interface ITableData {
		id: string;
		name: string;
		eventId: null | string;
		userId: string;
		maxPlayers: number;
		minPlayers: number;
		minBuyIn: number;
		maxBuyIn: number;
		ante: number;
		handOver: boolean;
		deleted: boolean;
		chatBanned: boolean;
		codeID: string;
		codePassword: string;
		roomId: string;
		createdAt: string;
		updatedAt: string;
		removedAt: string;
	}

	interface IUser {
		id: string;
		username: string;
		image: string;
		email: string;
		name: string;
		password: string;
		token: string;
		salt: string;
		role: "USER" | "BOT";
		chipsAmount: number;
		seamLessToken: string;
		deviceId: null;
		createdAt: string;
		updatedAt: string;
		removedAt: string;
	}

	interface IPlayerTableData {
		id: string;
		userId: string;
		socketId: string;
		buyIn: number;
		stack: number;
		previousStack: number;
		tableId: string;
		isTurn: boolean;
		leaveNextMatch: boolean;
		createdAt: string;
		user: IUser;
	}

	interface ILeaveTableData {
		playerId: string;
		tableId: string;
	}

	interface ICardData {
		id: string;
		rank: string;
		suit: string;
	}

	interface IParticipant {
		id: string;
		matchId: string;
		playerId: string;
		cardOneId: string;
		cardTwoId: string;
		bet: number;
		totalBet: number;
		isChecked: boolean;
		isFolded: boolean;
		isAllIn: boolean;
		lastAction: string;
		createdAt: string;
		player: IPlayerTableData;
		cardOne: ICardData;
		cardTwo: ICardData;
	}

	interface IMathComingData {
		isComing: boolean;
		tableId: string;
	}

	interface IMatch {
		id: string;
		tableId: string;
		startTime: null;
		endTime: null;
		numberPlayers: number;
		deckId: string;
		pot: number;
		mainPot: number;
		sidePot: string;
		callAmount: number;
		minBet: number;
		minRaise: number;
		isPreFlop: boolean;
		isFlop: boolean;
		isTurn: boolean;
		isRiver: boolean;
		isShowdown: boolean;
		isAllAllIn: boolean;
		buttonId: string;
		smallBlindId: string;
		bigBlindId: string;
		createdAt: string;
		table: ITableData;
		board: ICardData[];
		participants: IParticipant[];
		winMessages?: IWinnerMessage[];
		winners?: IWinnerData[];
	}

	interface IMathStartedData {
		match: IMatch;
		playerId: string;
		tableId: string;
	}

	interface IUpdatePlayerData {
		tableId: string;
		players: IPlayerTableData[];
		match: IMatch;
	}

	interface IJoinTableData {
		player: IPlayerTableData;
		tableId: string;
	}

	interface IChangeTurnData {
		matchData: IMatch;
		playerId: string;
	}

	interface IWinnerMessage {
		id: string;
		matchId: string;
		userId: string;
		content: string;
		handName: string;
		amount: number;
		bestHand: string[];
		winnerHand: string[];
		createdAt: string;
	}

	interface IWinnerData {
		id: string;
		userId: string;
		socketId: string;
		buyIn: number;
		stack: number;
		previousStack: number;
		tableId: string;
		isTurn: boolean;
		leaveNextMatch: boolean;
		createdAt: string;
	}

	interface IPlayerData {
		participant: IParticipant;
		lastBetParticipant: IParticipant | null;
		currentPot: number;
		currentStack: number;
		currentBet: number;
		currentCallAmount: number;
		canNotCall: boolean;
		canNotCheck: boolean;
		quarter: number;
		half: number;
		callSize: number;
		lastBet: number;
		isLastHalfType: boolean;
		isLastFullType: boolean;
		max: number;
		min: number;
		canQuarter: boolean;
		canHalf: boolean;
		canFull: boolean;
		canRaise: boolean;
		isShowdown: boolean;
	}

	interface ITable extends ITableData {
		players?: IPlayerTableData[];
	}

	export type IHighlightCard = {
		cards: ICardData[];
		name: string;
	};

	export type IPlayerHighlightCards = {
		[key: string]: IHighlightCard;
	};

	export type IHighlightResponse = {
		playerHighlightSet: IPlayerHighlightCards;
		isAllAllIn: boolean;
	};

	export type IParticipantData = {
		tableId: string;
		participant: IParticipant;
	};

	export type IRebuyData = {
		tableId: string;
		player: IPlayerTableData;
	};

	export type IMissingData = {
		tableId: string;
		player: IPlayerTableData;
	};

	export type IRebuy = {
		canAutoRebuy: boolean;
		isAutoRebuy: boolean;
		autoRebuyAmount: number;
	};
}
