type WorkerMessage = "start" | "stop" | "turn";
type WorkerResponse = {
	type: "update";
	deltaTime: number;
};

export default () => {
	const ctx: Worker = self as unknown as Worker;

	let running = false;
	let lastTime = Date.now();
	let animationFrameId: ReturnType<typeof setTimeout> | null = null;
	let turnTimer: ReturnType<typeof setTimeout> | null = null;
	const TURN_DURATION = 8000;

	ctx.onmessage = (e: MessageEvent<WorkerMessage>) => {
		try {
			switch (e.data) {
				case "start":
					if (!running) {
						running = true;
						lastTime = Date.now();
						gameLoop();
					}
					break;

				case "stop":
					running = false;
					if (animationFrameId) {
						clearTimeout(animationFrameId);
					}
					break;

				default:
					console.warn("Unknown message received:", e.data);
			}
		} catch (error) {
			console.error("Error in worker message handler:", error);
			ctx.postMessage({
				type: "error",
				error: error,
			});
		}
	};

	function handleTurn(playerId: string, isTurn: boolean) {
		if (turnTimer) {
			clearTimeout(turnTimer);
			turnTimer = null;
		}

		if (isTurn) {
			turnTimer = setTimeout(() => {
				ctx.postMessage({
					type: "turn",
					playerId: playerId,
					action: "fold",
					timeout: true,
				});
			}, TURN_DURATION);
		}
	}

	function gameLoop() {
		if (!running) return;

		try {
			const currentTime = Date.now();
			const deltaTime = currentTime - lastTime;
			lastTime = currentTime;

			ctx.postMessage({
				type: "update",
				deltaTime: deltaTime,
			} as WorkerResponse);

			animationFrameId = setTimeout(() => {
				gameLoop();
			}, 1000);
		} catch (error) {
			console.error("Error in game loop:", error);
			running = false;
			ctx.postMessage({
				type: "error",
				error: error,
			});
		}
	}
};
