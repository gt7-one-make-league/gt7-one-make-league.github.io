import {useState} from "react";
import {DnfBadge} from "../../components/dnf-badge/dnf-badge.tsx";
import type {SeasonData} from "../../data/types.ts";
import type {SeasonSummary} from "../../standings/season-summary.ts";
import {racedRounds, rankStandings} from "../../standings/standings.ts";
import type {DriverStanding, RoundScore} from "../../standings/standings.ts";
import styles from "./standings-table.module.css";

type StandingsView = "official" | "all";

interface StandingsTableProps {
	season: SeasonData;
	summary: SeasonSummary;
}

function viewNote(view: StandingsView, season: SeasonData, counted: number | null): string {
	if (view === "all") {
		return "Every result added up, with nothing dropped.";
	}
	if (counted === null) {
		return `Official standings: each driver's worst ${season.droppedResults} results are dropped.`;
	}
	return `Official standings: each driver's best ${counted} results count; missed races and DNFs count as 0 before the worst ${season.droppedResults} are dropped.`;
}

function ScoreCell({score, view}: {score: RoundScore; view: StandingsView}) {
	if (score.points === null) {
		return <td className={styles.missed}><span aria-hidden="true">-</span><span className="visually-hidden">Did not start</span></td>;
	}
	const dropped = view === "official" && !score.counted;
	return (
		<td className={dropped ? styles.dropped : undefined}>
			{score.dnf ? <DnfBadge /> : score.points}
			{score.fastestLap && <span className={styles.fastest} aria-hidden="true" />}
			{score.fastestLap && <span className="visually-hidden">, fastest lap</span>}
			{dropped && <span className="visually-hidden">, dropped</span>}
		</td>
	);
}

function StandingRow({row, view}: {row: DriverStanding; view: StandingsView}) {
	return (
		<tr className={row.position === 1 ? styles.leader : undefined}>
			<td className={styles.position}>{row.tied ? "=" : ""}{row.position}</td>
			<th scope="row" className={styles.driver}>{row.driver}</th>
			{row.scores.map((score) => <ScoreCell key={score.round} score={score} view={view} />)}
			<td className={styles.total}>{view === "official" ? row.points : row.total}</td>
		</tr>
	);
}

export function StandingsTable({season, summary}: StandingsTableProps) {
	const [view, setView] = useState<StandingsView>("official");
	const raced = racedRounds(season);
	const rows = view === "official" ? summary.standings : rankStandings(summary.standings, (row) => row.total);
	const views: {value: StandingsView; label: string}[] = [
		{value: "official", label: summary.countedResults === null ? "Official" : `Best ${summary.countedResults}`},
		{value: "all", label: "All results"},
	];
	return (
		<div className={styles.standings}>
			<div className={styles.toolbar} role="group" aria-label="Standings view">
				{views.map((option) => (
					<button key={option.value} type="button" aria-pressed={view === option.value} onClick={() => setView(option.value)}>
						{option.label}
					</button>
				))}
			</div>
			<p className={styles.note}>{viewNote(view, season, summary.countedResults)}</p>
			<div className={styles.scroll} tabIndex={0} role="region" aria-label="Driver standings, scroll sideways for every round">
				<table className={styles.table}>
					<thead>
						<tr>
							<th scope="col" className={styles.position}>Pos</th>
							<th scope="col" className={styles.driver}>Driver</th>
							{raced.map((round) => (
								<th scope="col" key={round.number}><abbr title={round.race.track}>R{round.number}</abbr></th>
							))}
							<th scope="col" className={styles.total}>{view === "official" ? "Points" : "Total"}</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => <StandingRow key={row.driver} row={row} view={view} />)}
					</tbody>
				</table>
			</div>
			<ul className={styles.legend}>
				<li><span className={styles.fastest} aria-hidden="true" /> Fastest lap, bonus included</li>
				{view === "official" && <li><span className={styles["dropped-sample"]}>12</span> Dropped result</li>}
				<li><span aria-hidden="true">-</span> Did not start</li>
			</ul>
		</div>
	);
}
