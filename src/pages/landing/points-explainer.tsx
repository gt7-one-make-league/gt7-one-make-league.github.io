import {SectionHeading} from "../../components/section-heading/section-heading.tsx";
import type {SeasonData} from "../../data/types.ts";
import type {SeasonSummary} from "../../standings/season-summary.ts";
import {ordinal, pluralize} from "../../text/text.ts";
import styles from "./points-explainer.module.css";

interface PointsExplainerProps {
	season: SeasonData;
	summary: SeasonSummary;
}

function dropsRule(season: SeasonData, counted: number | null): string {
	if (counted === null) {
		return `Your worst ${season.droppedResults} results are dropped from the championship.`;
	}
	return `Your best ${counted} results count toward the championship; your worst ${season.droppedResults} are dropped.`;
}

export function PointsExplainer({season, summary}: PointsExplainerProps) {
	return (
		<section id="points" className={`page-width ${styles.section}`}>
			<SectionHeading title="How points work" />
			<div className={styles.layout}>
				<ul className={styles.rules}>
					<li>Fastest lap earns {pluralize(season.fastestLapBonus, "extra point")}. A DNF scores 0.</li>
					<li>{dropsRule(season, summary.countedResults)}</li>
				</ul>
				<div className={styles.table}>
					<ul className={styles.grid}>
						{season.points.map((points, index) => (
							<li key={index} className={styles.cell}>
								<span className={styles["cell-label"]}>P{index + 1}</span>
								<strong className={styles["cell-value"]}>{points}</strong>
							</li>
						))}
						<li className={`${styles.cell} ${styles.bonus}`}>
							<span className={styles["cell-label"]}>Fast lap</span>
							<strong className={styles["cell-value"]}>+{season.fastestLapBonus}</strong>
						</li>
					</ul>
					<p className={styles.note}>{ordinal(season.points.length + 1)} and below score 0.</p>
				</div>
			</div>
		</section>
	);
}
