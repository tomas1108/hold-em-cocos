export enum TableEvent {
	JOIN_TABLE = "JOIN_TABLE",
	LEAVE_TABLE = "LEAVE_TABLE",
	CHANGE_TABLE = "CHANGE_TABLE",
	TABLE_LEFT = "TABLE_LEFT",
	TABLE_JOINED = "TABLE_JOINED",

	TABLE_MESSAGE = "TABLE_MESSAGE",
	NEXT_MATCH_IS_COMING = "NEXT_MATCH_IS_COMING",
	PLAYERS_UPDATED = "PLAYERS_UPDATED",
	MATCH_STARTED = "MATCH_STARTED",
	START_INIT_MATCH = "START_INIT_MATCH",

	UPDATE_TURN = "UPDATE_TURN",
	UPDATE_FOLD = "UPDATE_FOLD",
}
