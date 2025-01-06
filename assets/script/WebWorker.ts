import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import playerWorker from "db://assets/workers/player";
import { Component } from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { Logger } from "db://oops-framework/core/common/log/Logger";
import { game } from "cc";
import { Game } from "cc";

const { ccclass, property } = _decorator;

export enum WorkerEvent {
	UPDATE = "update",
	START = "start",
	STOP = "stop",
}

@ecs.register("NetworkManager")
export class WebWorker extends ecs.Entity {
	private worker: Worker | null = null;

	protected init() {
		Logger.logNet("WebWorker init");
		game.on(Game.EVENT_HIDE, this.onGameBackground, this);
		game.on(Game.EVENT_SHOW, this.onGameForeground, this);

		try {
			const code = playerWorker.toString();
			const blob = new Blob([`(${code})()`]);
			this.worker = new Worker(URL.createObjectURL(blob));

			this.worker.onmessage = (e) => {
				if (e.data.type === "update") {
					this.handleWorkerUpdate(e.data.deltaTime);
				}
			};

			this.worker.onerror = (e) => {
				console.error(e);
			};
		} catch (error) {
			console.error("Failed to create worker:", error);
		}
	}

	private onGameBackground() {
		if (this.worker) {
			this.worker.postMessage("start");
		}
	}

	private onGameForeground() {
		if (this.worker) {
			this.worker.postMessage("stop");
		}
	}

	postMessage(data: string | object) {
		if (this.worker) {
			this.worker.postMessage(data);
		}
	}

	stop() {
		if (this.worker) {
			this.worker.postMessage("stop");
		}
	}

	private handleWorkerUpdate(deltaTime: number) {
		oops.message.dispatchEvent(WorkerEvent.UPDATE, deltaTime);
	}

	destroy(): void {
		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
		}
		game.off(Game.EVENT_HIDE, this.onGameBackground, this);
		game.off(Game.EVENT_SHOW, this.onGameForeground, this);
	}
}
