import type { Vec3, Node } from "cc";
import { Layout } from "cc";
import { UITransform } from "cc";
import { v3 } from "cc";

export function getWorldPosition(node: Node): Vec3 {
	const pos = node.getPosition();
	const parent = node.parent;
	if (parent) {
		const uiTransform = parent.getComponent(UITransform);
		if (uiTransform) {
			return uiTransform.convertToWorldSpaceAR(pos);
		}
	}
	return pos;
}

export function getNodePosition(layoutNode: Node, targetNode: Node): Vec3 {
	const uiTransform = layoutNode.getComponent(UITransform);
	if (uiTransform) {
		return uiTransform.convertToNodeSpaceAR(getWorldPosition(targetNode));
	}
	return targetNode.getPosition();
}

export function getRelativePosition(node: Node, targetNode: Node): Vec3 {
	const worldPos = getWorldPosition(node);
	const uiTransform = targetNode.getComponent(UITransform);
	if (uiTransform) {
		return uiTransform.convertToNodeSpaceAR(worldPos);
	}
	return worldPos;
}

export function getCenterPosition(node: Node): Vec3 {
	const uiTransform = node.getComponent(UITransform);
	if (uiTransform) {
		const width = uiTransform.width;
		const height = uiTransform.height;

		const x = node.position.x + width * 0.5;
		const y = node.position.y + height * 0.5;

		return v3(x, y, node.position.z);
	}
	return node.position;
}

export function getLayoutPosition(node: Node): Vec3 {
	const layout = node.parent?.getComponent(Layout);
	if (layout) {
		layout.updateLayout();
	}
	return getWorldPosition(node);
}

export function getNodeBounds(node: Node): {
	top: number;
	bottom: number;
	left: number;
	right: number;
} | null {
	const uiTransform = node.getComponent(UITransform);
	if (uiTransform) {
		const worldPos = getWorldPosition(node);
		const width = uiTransform.width;
		const height = uiTransform.height;
		const anchor = uiTransform.anchorPoint;

		return {
			top: worldPos.y + height * (1 - anchor.y),
			bottom: worldPos.y - height * anchor.y,
			left: worldPos.x - width * anchor.x,
			right: worldPos.x + width * (1 - anchor.x),
		};
	}
	return null;
}
