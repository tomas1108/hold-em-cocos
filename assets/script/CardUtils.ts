import type { Node, Vec3 } from "cc";
import type { Tween } from "cc";
import { v3 } from "cc";
import { easing } from "cc";
import { tween } from "cc";

export const getCardResPath = (rank: string, suit: string) => {
	const path = `textures/pockers/${suit.toLowerCase()}`;
	const sprite = `${rank.toLowerCase()}_${suit.toLowerCase()}`;
	return { path, sprite };
};

export const tweenCardToNode = (
	node: Node,
	position: Vec3,
	duration: number,
	callback: () => void,
): Tween => {
	return tween(node)
		.delay(0)
		.set({ scale: v3(0, 0, 1), opacity: 200 })
		.parallel(
			tween().to(duration * 0.7, { position }, { easing: easing.sineOut }),
			tween().sequence(
				tween()
					.to(
						duration * 0.4,
						{
							scale: v3(0.2, 0.2, 1),
							angle: 180,
							opacity: 255,
						},
						{ easing: easing.sineOut },
					)
					.to(
						duration * 0.3,
						{
							scale: v3(1, 1, 1),
							angle: 360,
						},
						{ easing: easing.sineInOut },
					)
					.call(callback),
			),
		)
		.start();
};

export const flipCardToNode = (
	node: Node,
	duration: number,
	callback: () => void,
): Tween => {
	return tween(node)
		.delay(0)
		.to(duration * 0.4, { scale: v3(0, 1, 1) }, { easing: "quadIn" })
		.call(callback)
		.to(duration * 0.3, { scale: v3(1, 1, 1) }, { easing: "quadOut" })
		.start();
};

const rankMap = {
	A: "A",
	"2": "TWO",
	"3": "THREE",
	"4": "FOUR",
	"5": "FIVE",
	"6": "SIX",
	"7": "SEVEN",
	"8": "EIGHT",
	"9": "NINE",
	T: "TEN",
	J: "J",
	Q: "Q",
	K: "K",
};

const suitMap = {
	H: "HEARTS",
	D: "DIAMONDS",
	C: "CLUBS",
	S: "SPADES",
};

const rankMapReverse: { [key: string]: string } = {
	A: "A",
	TWO: "2",
	THREE: "3",
	FOUR: "4",
	FIVE: "5",
	SIX: "6",
	SEVEN: "7",
	EIGHT: "8",
	NINE: "9",
	TEN: "T",
	J: "J",
	Q: "Q",
	K: "K",
};

const starRatings: { [key: string]: number } = {
	AA: 9,
	KK: 9,
	QQ: 9,
	JJ: 9,
	AKs: 9,
	TT: 8,
	AQs: 8,
	AJs: 8,
	AK: 8,
	KQs: 8,
	ATs: 7,
	KJs: 7,
	AQ: 7,
	"99": 7,
	QJs: 7,
	KTs: 7,
	"88": 6,
	QTs: 6,
	A9s: 6,
	AJ: 6,
	JTs: 6,
	KQ: 6,
	A8s: 6,
	AT: 6,
	K9s: 5,
	A7s: 5,
	KJ: 5,
	A5s: 5,
	Q9s: 5,
	T9s: 5,
	"77": 5,
	J9s: 5,
	A6s: 5,
	QJ: 5,
	A4s: 5,
	KT: 5,
	QT: 5,
	A3s: 5,
	K8s: 5,
	JT: 5,
	A2s: 5,
	Q8s: 5,
	T8s: 4,
	K7s: 4,
	"98s": 4,
	"66": 4,
	J8s: 4,
	A9: 4,
	K6s: 4,
	K5s: 4,
	A8: 4,
	"87s": 3,
	"97s": 3,
	K4s: 3,
	Q7s: 3,
	T7s: 3,
	K9: 3,
	J7s: 3,
	T9: 3,
	"55": 3,
	Q6s: 3,
	Q9: 3,
	K3s: 3,
	J9: 3,
	A7: 3,
	Q5s: 3,
	A5: 3,
	K2s: 3,
	Q4s: 2,
	A6: 2,
	T6s: 2,
	J6s: 2,
	A4: 2,
	J5s: 2,
	K8: 2,
	Q3s: 2,
	"44": 2,
	T8: 2,
	A3: 2,
	J8: 2,
	Q8: 2,
	K7: 2,
	A2: 2,
	K6: 2,
};

const rankOrder: { [key: string]: number } = {
	A: 14,
	K: 13,
	Q: 12,
	J: 11,
	T: 10,
	"9": 9,
	"8": 8,
	"7": 7,
	"6": 6,
	"5": 5,
	"4": 4,
	"3": 3,
	"2": 2,
};

export const getStarRating = (card1: string, card2: string): number => {
	if (!card1 || !card2) return 1;

	const [rank1, suit1] = card1.split("_");
	const [rank2, suit2] = card2.split("_");
	const sameSuit = suit1 === suit2;

	const formattedRank1 = rankMapReverse[rank1];
	const formattedRank2 = rankMapReverse[rank2];

	let cardsString = [formattedRank1, formattedRank2]
		.sort((a, b) => rankOrder[b] - rankOrder[a])
		.join("");
	if (sameSuit) cardsString += "s";

	return starRatings[cardsString] || 1;
};

export const formattedStringToCards = (value: string) => {
	const cards = value.replace(/[\[\] ']/g, "").split(",");

	return cards.map((card) => {
		return {
			rank: rankMap[card[0] as keyof typeof rankMap],
			suit: suitMap[card[1] as keyof typeof suitMap],
		};
	});
};
