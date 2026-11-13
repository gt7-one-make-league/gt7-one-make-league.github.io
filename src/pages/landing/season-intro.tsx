import type {SeasonData, SeasonIndexEntry} from "../../data/types.ts";
import {formatTime, formatWeekday, raceInstant, zoneName} from "../../race-time/race-time.ts";
import {dot} from "../../text/text.ts";
import styles from "./season-intro.module.css";

// "Race nights: Thursdays, 7:30 PM Pacific Time", from the first race night's date
function raceNightsLine(season: SeasonData): string | null {
	const firstWeek = season.weeks.at(0);
	if (!firstWeek) {
		return null;
	}
	const {timeZone} = season.raceTime;
	const instant = raceInstant(firstWeek.date, season.raceTime);
	return `Race nights: ${formatWeekday(instant, timeZone)}s, ${formatTime(instant, timeZone)} ${zoneName(instant, timeZone)}`;
}

export function SeasonIntro({entry, season}: {entry: SeasonIndexEntry; season: SeasonData}) {
	const raceNights = raceNightsLine(season);
	return (
		<section className={`page-width ${styles.intro}`}>
			<h1 className={styles.title}>GT7 One Make League</h1>
			<div className={styles.rule} aria-hidden="true" />
			<p className={styles.schedule}>{entry.name}{raceNights && <>{dot}{raceNights}</>}</p>
		</section>
	);
}
