import {Card} from "../../components/card/card.tsx";
import type {SeasonData} from "../../data/types.ts";
import {raceTimeLines} from "../../race-time/race-time.ts";
import type {RaceNight} from "../../standings/season-summary.ts";
import {dot} from "../../text/text.ts";
import styles from "./next-up-card.module.css";

interface NextUpCardProps {
	season: SeasonData;
	night: RaceNight;
}

export function NextUpCard({season, night}: NextUpCardProps) {
	const times = raceTimeLines(night.week.date, season.raceTime);
	const tracks = night.rounds.map((round) => round.race.track);
	return (
		<Card variant="dashed">
			<div className={styles.layout}>
				<div>
					<span className={styles.label}>Next up: week {night.number}</span>
					<p className={styles.car}>{night.week.car ?? "Car to be announced"}</p>
				</div>
				<div className={styles.when}>
					<span className={styles["league-time"]}>{times.day}{dot}{times.time}</span>
					{times.local && <span className={styles["local-time"]}>{times.local} your time</span>}
				</div>
			</div>
			{tracks.length > 0 && <p className={styles.tracks}>{tracks.join(dot)}</p>}
		</Card>
	);
}
