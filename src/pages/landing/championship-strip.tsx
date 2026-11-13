import type {SeasonData} from "../../data/types.ts";
import {raceTimeLines} from "../../race-time/race-time.ts";
import type {RaceNight, SeasonSummary} from "../../standings/season-summary.ts";
import {dot} from "../../text/text.ts";
import styles from "./championship-strip.module.css";

const leaderCount = 5;

interface ChampionshipStripProps {
	season: SeasonData;
	summary: SeasonSummary;
}

// The top of the table at a glance; drivers tied on the last position shown are all included
function Leaders({summary}: {summary: SeasonSummary}) {
	const leaders = summary.standings.filter((row) => row.position <= leaderCount);
	return (
		<div className={styles.panel}>
			<h2 className={styles.heading}>Standings<span className={styles.qualifier}>{dot}After round {summary.roundsCompleted}</span></h2>
			<ol className={styles.leaders}>
				{leaders.map((row) => (
					<li key={row.driver} className={styles.leader}>
						<span className={styles.position}>{row.tied ? "=" : ""}{row.position}</span>
						<span className={styles.driver}>{row.driver}</span>
						<span className={styles.points}>
							{row.points}
							<span className="visually-hidden"> points</span>
						</span>
					</li>
				))}
			</ol>
		</div>
	);
}

// Quick-reference facts people check, like opening hours: when (league time, then their own), the car, the circuits
function NextRaceNight({season, night}: {season: SeasonData; night: RaceNight}) {
	const times = raceTimeLines(night.week.date, season.raceTime);
	return (
		<div className={styles.panel}>
			<h2 className={styles.heading}>Next race night<span className={styles.qualifier}>{dot}Week {night.number}</span></h2>
			<dl className={styles.facts}>
				<dt>When</dt>
				<dd>
					<span className={styles.line}>{times.day}</span>
					<span className={styles.line}>{times.time}</span>
					{times.local && <span className={`${styles.line} ${styles.secondary}`}>{times.local} your time</span>}
				</dd>
				<dt>Car</dt>
				<dd>{night.week.car ?? "To be announced"}</dd>
				{night.rounds.length > 0 && (
					<>
						<dt>Circuits</dt>
						<dd>
							{night.rounds.map((round) => <span key={round.number} className={styles.line}>{round.race.track}</span>)}
						</dd>
					</>
				)}
			</dl>
		</div>
	);
}

export function ChampionshipStrip({season, summary}: ChampionshipStripProps) {
	const hasStandings = summary.standings.length > 0;
	if (!hasStandings && !summary.nextNight) {
		return null;
	}
	return (
		<section className={styles.strip} aria-label="Championship overview">
			<div className={`page-width ${styles.grid}`}>
				{hasStandings && <Leaders summary={summary} />}
				{summary.nextNight && <NextRaceNight season={season} night={summary.nextNight} />}
			</div>
		</section>
	);
}
