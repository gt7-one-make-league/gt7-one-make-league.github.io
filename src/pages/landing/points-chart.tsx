import {useMemo, useRef, useState} from "react";
import type {PointerEvent} from "react";
import type {SeasonData} from "../../data/types.ts";
import {useElementWidth} from "../../hooks/use-element-width.ts";
import type {SeasonSummary} from "../../standings/season-summary.ts";
import {ChartPlot} from "./points-chart-plot.tsx";
import {buildChartModel, chartGeometry} from "./points-chart-model.ts";
import {RankingPanel} from "./points-chart-ranking.tsx";
import styles from "./points-chart.module.css";

interface PointsChartProps {
	season: SeasonData;
	summary: SeasonSummary;
}

// Slider positions count the rounds with results; labels show each round's real number
interface RoundControlsProps {
	selectedRound: number;
	roundCount: number;
	roundNumber: number;
	lastRoundNumber: number;
	track: string;
	onSelect: (round: number) => void;
}

function RoundControls({selectedRound, roundCount, roundNumber, lastRoundNumber, track, onSelect}: RoundControlsProps) {
	return (
		<div className={styles.controls}>
			<div className={styles["round-label"]}>
				<label htmlFor="round-slider">Round <output htmlFor="round-slider">{roundNumber}</output> of {lastRoundNumber}</label>
				<span className={styles.track}>{track}</span>
			</div>
			<div className={styles.stepper}>
				<button type="button" aria-label="Previous round" disabled={selectedRound <= 1} onClick={() => onSelect(selectedRound - 1)}>-</button>
				<input
					id="round-slider"
					type="range"
					min={1}
					max={roundCount}
					step={1}
					value={selectedRound}
					aria-valuetext={`Round ${roundNumber}: ${track}`}
					onChange={(event) => onSelect(Number(event.target.value))}
				/>
				<button type="button" aria-label="Next round" disabled={selectedRound >= roundCount} onClick={() => onSelect(selectedRound + 1)}>+</button>
			</div>
		</div>
	);
}

export function PointsChart({season, summary}: PointsChartProps) {
	const model = useMemo(() => buildChartModel(season, summary.standings), [season, summary.standings]);
	const roundCount = model.rounds.length;
	const plotRef = useRef<HTMLDivElement>(null);
	const width = useElementWidth(plotRef, 0);
	const [selectedRound, setSelectedRound] = useState(roundCount);
	const [hoverRound, setHoverRound] = useState<number | null>(null);
	const [highlighted, setHighlighted] = useState<string | null>(null);
	const shownRound = hoverRound ?? selectedRound;
	const geometry = chartGeometry(width, roundCount, model.maxPoints);

	// The crosshair snaps to the nearest round under the pointer
	const trackPointer = (event: PointerEvent<SVGSVGElement>) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		setHoverRound(geometry.roundAt(event.clientX - bounds.left));
	};
	const toggleHighlight = (driver: string) => setHighlighted((current) => current === driver ? null : driver);

	return (
		<div className={styles.chart}>
			<RoundControls
				selectedRound={selectedRound}
				roundCount={roundCount}
				roundNumber={model.rounds[shownRound - 1].number}
				lastRoundNumber={model.rounds[roundCount - 1].number}
				track={model.rounds[shownRound - 1].race.track}
				onSelect={setSelectedRound}
			/>
			<div className={styles.layout}>
				<div ref={plotRef} className={styles.plot}>
					{width > 0 && (
						<ChartPlot
							model={model}
							geometry={geometry}
							shownRound={shownRound}
							highlighted={highlighted}
							onPointerMove={trackPointer}
							onPointerLeave={() => setHoverRound(null)}
						/>
					)}
				</div>
				<RankingPanel model={model} shownRound={shownRound} highlighted={highlighted} onToggle={toggleHighlight} />
			</div>
			<p className={styles.footnote}>
				{summary.countedResults === null
					? "Official points after each round."
					: `Official points after each round, best ${summary.countedResults} results counted.`}
				{model.series.some((line) => line.slot === null) && " Gray lines are the other drivers."}
			</p>
		</div>
	);
}
