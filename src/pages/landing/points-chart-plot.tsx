import type {PointerEvent} from "react";
import {seriesColor} from "./points-chart-model.ts";
import type {ChartGeometry, ChartModel, ChartSeries} from "./points-chart-model.ts";
import styles from "./points-chart.module.css";

interface ChartPlotProps {
	model: ChartModel;
	geometry: ChartGeometry;
	shownRound: number;
	highlighted: string | null;
	onPointerMove: (event: PointerEvent<SVGSVGElement>) => void;
	onPointerLeave: () => void;
}

interface LayerProps {
	model: ChartModel;
	geometry: ChartGeometry;
	shownRound: number;
	highlighted: string | null;
}

function linePoints(values: number[], geometry: ChartGeometry): string {
	return values.map((value, round) => `${geometry.x(round)},${geometry.y(value)}`).join(" ");
}

function lineClass(line: ChartSeries, highlighted: string | null): string {
	if (line.driver === highlighted) {
		return styles["line-highlighted"];
	}
	return line.slot === null ? styles["line-other"] : styles.line;
}

// Gray context lines first, then colored lines, then the highlighted line on top
function drawOrder(line: ChartSeries, highlighted: string | null): number {
	if (line.driver === highlighted) {
		return 2;
	}
	return line.slot === null ? 0 : 1;
}

function Axes({model, geometry, shownRound}: LayerProps) {
	const labeledRounds = Array.from({length: model.rounds.length + 1}, (_, round) => round)
		.filter((round) => round % geometry.labelEvery === 0);
	return (
		<g aria-hidden="true">
			{geometry.yTicks.map((tick) => (
				<g key={tick}>
					<line className={tick === 0 ? styles.baseline : styles.grid} x1={geometry.plotLeft} x2={geometry.plotRight} y1={geometry.y(tick)} y2={geometry.y(tick)} />
					<text className={styles.tick} x={geometry.plotLeft - 8} y={geometry.y(tick)} dy="0.32em" textAnchor="end">{tick}</text>
				</g>
			))}
			{labeledRounds.map((round) => (
				<text
					key={round}
					className={round === shownRound ? styles["tick-active"] : styles.tick}
					x={geometry.x(round)}
					y={geometry.plotBottom + 22}
					textAnchor="middle"
				>
					{round === 0 ? "Start" : `R${model.rounds[round - 1].number}`}
				</text>
			))}
		</g>
	);
}

function SeriesLines({model, geometry, highlighted}: LayerProps) {
	const ordered = [...model.series].sort((a, b) => drawOrder(a, highlighted) - drawOrder(b, highlighted));
	return (
		<g aria-hidden="true">
			{ordered.map((line) => (
				<polyline
					key={line.driver}
					className={lineClass(line, highlighted)}
					points={linePoints(line.values, geometry)}
					style={{stroke: seriesColor(line.slot)}}
					opacity={highlighted !== null && line.driver !== highlighted ? 0.2 : 1}
				/>
			))}
		</g>
	);
}

// The crosshair at the shown round, an end dot per colored line, and the highlighted driver's value
function RoundMarkers({model, geometry, shownRound, highlighted}: LayerProps) {
	const x = geometry.x(shownRound);
	const marked = model.series.filter((line) => line.slot !== null || line.driver === highlighted);
	const highlightedLine = model.series.find((line) => line.driver === highlighted);
	const nearRightEdge = x > geometry.plotRight - 60;
	return (
		<g aria-hidden="true">
			<line className={styles.crosshair} x1={x} x2={x} y1={geometry.plotTop} y2={geometry.plotBottom} />
			{marked.map((line) => (
				<circle
					key={line.driver}
					className={styles.marker}
					cx={x}
					cy={geometry.y(line.values[shownRound])}
					r={4}
					style={{fill: seriesColor(line.slot)}}
					opacity={highlighted !== null && line.driver !== highlighted ? 0.2 : 1}
				/>
			))}
			{highlightedLine && (
				<text
					className={styles["value-label"]}
					x={nearRightEdge ? x - 10 : x + 10}
					y={geometry.y(highlightedLine.values[shownRound]) - 10}
					textAnchor={nearRightEdge ? "end" : "start"}
				>
					{highlightedLine.values[shownRound]} pts
				</text>
			)}
		</g>
	);
}

function plotLabel(model: ChartModel, shownRound: number): string {
	const leaders = model.snapshots[shownRound - 1].slice(0, 3).map((row) => `${row.driver} ${row.points}`);
	return `Official points through round ${model.rounds[shownRound - 1].number}. Leading: ${leaders.join(", ")}.`;
}

export function ChartPlot({model, geometry, shownRound, highlighted, onPointerMove, onPointerLeave}: ChartPlotProps) {
	const layers = {model, geometry, shownRound, highlighted};
	return (
		<svg
			className={styles.svg}
			width={geometry.width}
			height={geometry.height}
			viewBox={`0 0 ${geometry.width} ${geometry.height}`}
			role="img"
			aria-label={plotLabel(model, shownRound)}
			onPointerMove={onPointerMove}
			onPointerLeave={onPointerLeave}
		>
			<Axes {...layers} />
			<SeriesLines {...layers} />
			<RoundMarkers {...layers} />
			<rect
				className={styles["hit-area"]}
				x={geometry.plotLeft}
				y={geometry.plotTop}
				width={Math.max(0, geometry.plotRight - geometry.plotLeft)}
				height={geometry.plotBottom - geometry.plotTop}
			/>
		</svg>
	);
}
