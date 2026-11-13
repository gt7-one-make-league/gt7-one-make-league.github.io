import {seriesColor} from "./points-chart-model.ts";
import type {ChartModel, ChartSeries} from "./points-chart-model.ts";
import styles from "./points-chart.module.css";

interface RankingPanelProps {
	model: ChartModel;
	shownRound: number;
	highlighted: string | null;
	onToggle: (driver: string) => void;
}

interface RankedLine {
	line: ChartSeries;
	points: number;
	position: number;
	tied: boolean;
}

// Every colored driver at the shown round, ranked against the whole field so the list never changes length
function rankAtRound(model: ChartModel, shownRound: number): RankedLine[] {
	const field = model.series.map((line) => line.values[shownRound]);
	return model.series
		.filter((line) => line.slot !== null)
		.map((line) => {
			const points = line.values[shownRound];
			return {
				line,
				points,
				position: 1 + field.filter((other) => other > points).length,
				tied: field.filter((other) => other === points).length > 1,
			};
		})
		.sort((a, b) => b.points - a.points || a.line.driver.localeCompare(b.line.driver));
}

export function RankingPanel({model, shownRound, highlighted, onToggle}: RankingPanelProps) {
	const ranked = rankAtRound(model, shownRound);
	const hasOthers = model.series.some((line) => line.slot === null);
	return (
		<div className={styles.ranking}>
			<div className={styles["ranking-head"]}>
				<span>Pos / driver</span>
				<span>Points</span>
			</div>
			<ul className={styles["ranking-list"]}>
				{ranked.map(({line, points, position, tied}) => (
					<li key={line.driver}>
						<button
							type="button"
							className={`${styles["ranking-row"]} ${highlighted !== null && highlighted !== line.driver ? styles.muted : ""}`}
							aria-pressed={highlighted === line.driver}
							onClick={() => onToggle(line.driver)}
						>
							<span className={styles["ranking-position"]}>{tied ? "=" : ""}{position}</span>
							<span className={styles.key} style={{borderColor: seriesColor(line.slot)}} aria-hidden="true" />
							<span className={styles["ranking-driver"]}>{line.driver}</span>
							<strong className={styles["ranking-points"]}>{points}</strong>
						</button>
					</li>
				))}
				{hasOthers && (
					<li className={styles["ranking-others"]}>
						<span className={styles.key} style={{borderColor: seriesColor(null)}} aria-hidden="true" />
						<span>Other drivers</span>
					</li>
				)}
			</ul>
			<p className={styles["ranking-note"]}>Select a driver to highlight their line.</p>
		</div>
	);
}
