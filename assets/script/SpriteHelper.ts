import { Sprite } from "cc";
import { Texture2D } from "cc";
import type { ImageAsset } from "cc";
import type { Node } from "cc";
import { SpriteAtlas } from "cc";
import { SpriteFrame } from "cc";
import { oops } from "db://oops-framework/core/Oops";

export const loadResImageSpriteToNode = (node: Node, path: string) => {
	const existSprite = oops.res.get(path, SpriteFrame);
	if (existSprite) {
		const sprite = node.getComponent(Sprite);
		if (sprite) {
			sprite.spriteFrame = existSprite;
		}
	} else {
		oops.res.loadAsync<ImageAsset>("bundle", path).then((res) => {
			const texture = new Texture2D();
			texture.image = res;

			const spriteFrame = new SpriteFrame();
			spriteFrame.texture = texture;

			const sprite = node.getComponent(Sprite);
			if (sprite) {
				sprite.spriteFrame = spriteFrame;
			}
		});
	}
};

export const loadResSpriteAtlasToNode = (
	node: Node,
	path: string,
	spriteName: string,
) => {
	const existSprite = oops.res.get(path, SpriteAtlas);
	if (existSprite) {
		const sprite = node.getComponent(Sprite);
		if (sprite) {
			sprite.spriteFrame = existSprite.getSpriteFrame(spriteName);
		}
	} else {
		oops.res.loadAsync<SpriteAtlas>("bundle", path).then((res) => {
			const spriteFrame = res.getSpriteFrame(spriteName);
			const sprite = node.getComponent(Sprite);
			if (sprite) {
				sprite.spriteFrame = spriteFrame;
			}
		});
	}
};
