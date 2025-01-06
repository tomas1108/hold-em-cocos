import { _decorator } from "cc";
import { Logger } from "db://oops-framework/core/common/log/Logger";
import { oops } from "db://oops-framework/core/Oops";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import type {
	INetworkTips,
	ISocket,
	MessageFunc,
	NetData,
} from "db://oops-framework/libs/network/NetInterface";
import { NetNode } from "db://oops-framework/libs/network/NetNode";
import { NetProtocolPako } from "db://oops-framework/libs/network/NetProtocolPako";
import type { Socket } from "socket.io-client";

interface IOSocket extends ISocket {
	io(): Socket | null;
}

export class NetGameTips implements INetworkTips {
	connectTips(isShow: boolean): void {
		if (isShow) {
			Logger.logNet("Game server is connecting");
		} else {
			Logger.logNet("Game server connection successful");
		}
	}

	reconnectTips(isShow: boolean): void {
		if (isShow) {
			Logger.logNet("Reconnection starts");
		} else {
			Logger.logNet("Reconnection successful");
		}
	}

	requestTips(isShow: boolean): void {
		if (isShow) {
			Logger.logNet("Start requesting data");
		} else {
			Logger.logNet("Request data completed");
		}
	}

	responseErrorCode(code: number): void {
		console.log("Game server error code", code);
	}
}

export class SocketIO implements IOSocket {
	private MAX_RECONNECT_ATTEMPTS = 5;
	private _ws: Socket | null = null;

	onConnected: ((this: Socket, ev: Event) => void) | null = null;
	onMessage: MessageFunc | null = null;
	onError: ((this: Socket, ev: Event) => void) | null = null;
	onClosed: ((this: Socket, ev: CloseEvent) => void) | null = null;

	connect(options: { url: string }) {
		if (!window.io) {
			Logger.logNet("socket.io-client not found, please download it from");
			return false;
		}

		if (this._ws) {
			if (this._ws.io._readyState === "opening") {
				Logger.logNet("websocket connecting, wait for a moment...");
				return false;
			}
		}

		this._ws = window.io(options.url, {
			transports: ["websocket"],
			reconnection: true,
			reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
		});

		this._ws.on("connect", () => {
			this.onConnected?.call(this._ws, new Event("connect"));
		});

		this._ws.on("error", (event) => {
			this.onError?.call(this._ws, event);
		});

		this._ws.on("disconnect", (event) => {
			this.onClosed?.call(this._ws, new CloseEvent(event));
		});

		this._ws.on("data", (msg) => {
			this.onMessage?.call(this._ws, msg);
		});

		return true;
	}

	send(buffer: NetData): number {
		if (this._ws && this._ws.io._readyState === "open") {
			this._ws.send(buffer);
			return 1;
		}
		return -1;
	}

	close() {
		if (this._ws) {
			this._ws.close();
		}
	}

	io(): Socket | null {
		return this._ws;
	}
}

export class NetProtocol extends NetProtocolPako {}

export class NetNodeGame extends NetNode {
	protected onMessage(msg: string): void {
		const jsonString = msg.replace(/^\d+/, "");
		const json = JSON.parse(jsonString);

		if (Array.isArray(json)) {
			const [event, data] = json;
			console.log("event", event, "data", data);
			super.onMessage(JSON.stringify(data));
			return;
		}
		super.onMessage(JSON.stringify(json));
	}
}

@ecs.register("NetworkManager")
export class NetworkManager extends ecs.Entity {
	net: NetNodeGame;
	ws: IOSocket;
	io: Socket;

	protected init() {
		this.net = new NetNodeGame();
		this.ws = new SocketIO();

		this.net.init(this.ws, new NetProtocol(), new NetGameTips());
		this.net.connect({
			url: `${oops.config.game.data.config.webSocketIp}${oops.config.game.data.config.webSocketPort}`,
		});

		this.io = this.ws.io();
	}
}
