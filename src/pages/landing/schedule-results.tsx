import {DnfBadge} from "../../components/dnf-badge/dnf-badge.tsx";
import type {RaceResult, SeasonData, Week} from "../../data/types.ts";
import {formatDay, raceInstant} from "../../race-time/race-time.ts";
import type {SeasonSummary} from "../../standings/season-summary.ts";
import {lapBonus, positionPoints, racePoints, seasonRounds} from "../../standings/standings.ts";
import type {Round} from "../../standings/standings.ts";
import {dot, pluralize} from "../../text/text.ts";
import {NextUpCard} from "./next-up-card.tsx";
import styles from "./schedule-results.module.css";

interface ScheduleResultsProps {
	season: SeasonData;
	summary: SeasonSummary;
}

function ResultTable({season, result}: {season: SeasonData; result: RaceResult}) {
	return (
		<div className={styles["result-scroll"]}>
			<table className={styles.results}>
				<thead>
					<tr>
						<th scope="col">Pos</th>
						<th scope="col" className={styles["result-driver"]}>Driver</th>
						<th scope="col">Position pts</th>
						<th scope="col">Lap bonus</th>
						<th scope="col">Total</th>
					</tr>
				</thead>
				<tbody>
					{result.finish.map((driver, index) => {
						const bonus = lapBonus(season, result, driver);
						return (
							<tr key={driver}>
								<td>{index + 1}</td>
								<th scope="row" className={styles["result-driver"]}>
									{driver}{result.dnf.includes(driver) && <DnfBadge className={styles["dnf-spacing"]} />}
								</th>
								<td>{positionPoints(season, result, driver)}</td>
								<td>{bonus > 0 ? `+${bonus}` : "-"}</td>
								<td className={styles["result-total"]}>{racePoints(season, result, driver)}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

function RaceEntry({season, round}: {season: SeasonData; round: Round}) {
	const result = round.race.result;
	const heading = (
		<span className={styles["race-name"]}>
			<span className={styles["race-number"]}>Round {round.number}</span>
			<span>{round.race.track}</span>
		</span>
	);
	if (!result) {
		const status = round.race.resultsMissing ? "Results missing" : "Upcoming";
		return <li className={styles.upcoming}>{heading}<span className={styles.status}>{status}</span></li>;
	}
	return (
		<li>
			<details className={styles.race}>
				<summary>
					{heading}
					<span className={styles.winner}>Winner <b>{result.finish[0]}</b></span>
				</summary>
				<p className={styles["fastest-lap"]}>
					Fastest lap <b>{result.fastestLap.driver}</b>{result.fastestLap.time && <>{dot}{result.fastestLap.time}</>}{dot}+{pluralize(season.fastestLapBonus, "point")}
				</p>
				<ResultTable season={season} result={result} />
			</details>
		</li>
	);
}

function WeekEntry({season, week, number, rounds}: {season: SeasonData; week: Week; number: number; rounds: Round[]}) {
	const day = formatDay(raceInstant(week.date, season.raceTime), season.raceTime.timeZone);
	return (
		<li id={`week-${number}`} className={styles.week}>
			<div className={styles["week-head"]}>
				<h3 className={styles["week-title"]}>Week {number}</h3>
				<span className={styles["week-meta"]}>{day}{dot}{week.car ?? "Car to be announced"}</span>
			</div>
			{rounds.length > 0 ? (
				<ol className={styles.races}>
					{rounds.map((round) => <RaceEntry key={round.number} season={season} round={round} />)}
				</ol>
			) : (
				<p className={styles.status}>Tracks to be announced</p>
			)}
		</li>
	);
}

export function ScheduleResults({season, summary}: ScheduleResultsProps) {
	const rounds = seasonRounds(season);
	return (
		<div className={styles.schedule}>
			{summary.nextNight && <NextUpCard season={season} night={summary.nextNight} />}
			<ol className={styles.weeks}>
				{season.weeks.map((week, index) => (
					<WeekEntry
						key={week.date}
						season={season}
						week={week}
						number={index + 1}
						rounds={rounds.filter((round) => round.week === week)}
					/>
				))}
			</ol>
		</div>
	);
}
