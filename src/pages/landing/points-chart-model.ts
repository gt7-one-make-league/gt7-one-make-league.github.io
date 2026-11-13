import type {SeasonData} from "../../data/types.ts";
import {computeStandings, racedRounds} from "../../standings/standings.ts";
import type {DriverStanding, RacedRound} from "../../standings/standings.ts";

// The categorical palette's size; drivers past it are drawn as gray context lines
export const coloredSeriesCount = 8;

export interface ChartSeries {
	driver: string;
	// Palette slot 1-8, or null for a gray context line
	slot: number | null;
	// Official points after each round; index 0 is the start of the season
	values: number[];
}

export interface ChartModel {
	rounds: RacedRound[];
	series: ChartSeries[];
	// Official standings after each round; index 0 is after round 1
	snapshots: DriverStanding[][];
	maxPoints: number;
}

// Colors go by the current standings order, so each driver keeps one color across every round
export function buildChartModel(season: SeasonData, standings: DriverStanding[]): ChartModel {
	const rounds = racedRounds(season);
	const snapshots = rounds.map((round) => computeStandings(season, round.number));
	const series = standings.map((standing, index) => ({
		driver: standing.driver,
		slot: index < coloredSeriesCount ? index + 1 : null,
		values: [0, ...snapshots.map((snapshot) => snapshot.find((row) => row.driver === standing.driver)?.points ?? 0)],
	}));
	const maxPoints = Math.max(0, ...series.flatMap((line) => line.values));
	return {rounds, series, snapshots, maxPoints};
}

export interface ChartGeometry {
	width: number;
	height: number;
	plotLeft: number;
	plotRight: number;
	plotTop: number;
	plotBottom: number;
	yTicks: number[];
	// Label every Nth round so labels never collide at narrow widths
	labelEvery: number;
	x: (round: number) => number;
	y: (points: number) => number;
	// The raced round nearest a horizontal pixel position
	roundAt: (pixelX: number) => number;
}

const chartHeight = 340;
const margin = {top: 16, right: 20, bottom: 36, left: 44};
const tickSteps = [5, 10, 20, 25, 50, 100, 200, 250, 500];
const minimumLabelSpacing = 40;

export function chartGeometry(width: number, roundCount: number, maxPoints: number): ChartGeometry {
	const step = tickSteps.find((candidate) => maxPoints / candidate <= 6) ?? 1000;
	const yMax = Math.max(step, Math.ceil(maxPoints / step) * step);
	const plotLeft = margin.left;
	const plotRight = width - margin.right;
	const plotTop = margin.top;
	const plotBottom = chartHeight - margin.bottom;
	const span = Math.max(1, roundCount);
	const roundWidth = (plotRight - plotLeft) / span;
	return {
		width,
		height: chartHeight,
		plotLeft,
		plotRight,
		plotTop,
		plotBottom,
		yTicks: Array.from({length: yMax / step + 1}, (_, index) => index * step),
		labelEvery: Math.max(1, Math.ceil(minimumLabelSpacing / roundWidth)),
		x: (round) => plotLeft + round * roundWidth,
		y: (points) => plotBottom - (points / yMax) * (plotBottom - plotTop),
		roundAt: (pixelX) => Math.min(roundCount, Math.max(1, Math.round((pixelX - plotLeft) / roundWidth))),
	};
}

export function seriesColor(slot: number | null): string {
	return slot === null ? "var(--chart-other)" : `var(--series-${slot})`;
}
