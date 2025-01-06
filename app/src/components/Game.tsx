import { useEffect } from "react";
import "./Game.css";

export const Game: React.FC = () => {
	// const [isLandscape, setIsLandscape] = useState<boolean>(false);
	// const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

	useEffect(() => {
		const checkOrientation = async () => {};
		const checkFullscreen = () => {};

		return () => {
			window.removeEventListener("resize", checkOrientation);
			document.removeEventListener("fullscreenchange", checkFullscreen);
		};
	}, []);

	return (
		<div className="contentWrap">
			<div id="GameDiv">
				<div id="Cocos3dGameContainer">
					<canvas id="GameCanvas" />
				</div>
			</div>
		</div>
	);
};
