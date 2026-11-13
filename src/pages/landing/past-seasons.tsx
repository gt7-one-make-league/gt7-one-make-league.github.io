import {Card} from "../../components/card/card.tsx";
import {SectionHeading} from "../../components/section-heading/section-heading.tsx";
import type {ExternalSeason, SeasonIndexEntry} from "../../data/types.ts";
import styles from "./past-seasons.module.css";

const placeClasses = [styles.first, styles.second, styles.third];

interface PastSeasonsProps {
	seasons: SeasonIndexEntry[];
}

function ExternalSeasonCard({entry, external}: {entry: SeasonIndexEntry; external: ExternalSeason}) {
	return (
		<Card className={styles.season}>
			<div>
				<span className={styles["season-name"]}>{entry.name}</span>
				<h3 className={styles.title}>{entry.title ?? entry.name}</h3>
				<p className={styles.format}>{entry.format}, {external.rounds} rounds.</p>
			</div>
			<ol className={styles.podium}>
				{external.podium.map((place, index) => (
					<li key={place.driver} className={styles.place}>
						<span className={`${styles.badge} ${placeClasses[index] ?? ""}`}>{index + 1}</span>
						<span className={styles.driver}>{place.driver}</span>
						<span className={styles.points}>{place.points}</span>
					</li>
				))}
			</ol>
			<p className={styles.note}>Final standings, best {external.countedResults} of {external.rounds} results.</p>
			<a className={styles.link} href={external.url}>{entry.name} site: full results</a>
		</Card>
	);
}

export function PastSeasons({seasons}: PastSeasonsProps) {
	const archived = seasons.filter((entry) => entry.external);
	if (archived.length === 0) {
		return null;
	}
	return (
		<section id="past" className={`page-width ${styles.section}`}>
			<SectionHeading title="Past seasons" />
			<div className={styles.list}>
				{archived.map((entry) => entry.external && (
					<ExternalSeasonCard key={entry.id} entry={entry} external={entry.external} />
				))}
			</div>
		</section>
	);
}
