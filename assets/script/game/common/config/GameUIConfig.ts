import {
	LayerType,
	type UIConfig,
} from "db://oops-framework/core/gui/layer/LayerManager";

export enum UIID {
	Loading = 1,
	Alert = 2,
	Confirm = 3,
	Background = 4,
	Login = 5,
	Register = 6,
	Layout = 7,
	Home = 8,
	Table = 9,
	Room = 10,
	Match = 11,

	Table_Confirm = 100,
}

export const UIConfigData: { [key: number]: UIConfig } = {
	[UIID.Loading]: {
		layer: LayerType.UI,
		prefab: "loading/prefab/loading",
	},
	[UIID.Alert]: {
		layer: LayerType.Dialog,
		prefab: "common/prefab/alert",
		mask: true,
	},
	[UIID.Confirm]: {
		layer: LayerType.Dialog,
		prefab: "common/prefab/confirm",
		mask: true,
	},
	[UIID.Background]: {
		layer: LayerType.UI,
		prefab: "common/prefab/background",
	},

	[UIID.Login]: { layer: LayerType.UI, prefab: "gui/auth/login" },
	[UIID.Register]: { layer: LayerType.UI, prefab: "gui/auth/register" },
	[UIID.Layout]: { layer: LayerType.UI, prefab: "game/layout" },
	[UIID.Home]: { layer: LayerType.UI, prefab: "game/home" },
	[UIID.Table]: { layer: LayerType.UI, prefab: "game/table" },
	[UIID.Room]: { layer: LayerType.UI, prefab: "game/room" },
	[UIID.Match]: { layer: LayerType.UI, prefab: "game/match" },

	[UIID.Table_Confirm]: {
		layer: LayerType.Dialog,
		prefab: "gui/prefab/confirm",
	},
};
