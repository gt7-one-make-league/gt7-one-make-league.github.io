import {SectionHeading} from "../../components/section-heading/section-heading.tsx";
import {SiteFooter} from "../../components/site-footer/site-footer.tsx";
import {SiteHeader} from "../../components/site-header/site-header.tsx";
import {Tag} from "../../components/tag/tag.tsx";
import {seasonData, seasonIndex} from "../../data/seasons.ts";
import {summarizeSeason} from "../../standings/season-summary.ts";
import {seasonRounds} from "../../standings/standings.ts";
import {ChampionshipStrip} from "./championship-strip.tsx";
import styles from "./landing-page.module.css";
import {PastSeasons} from "./past-seasons.tsx";
import {PointsChart} from "./points-chart.tsx";
import {PointsExplainer} from "./points-explainer.tsx";
import {RoundTag} from "./round-tag.tsx";
import {ScheduleResults} from "./schedule-results.tsx";
import {SeasonIntro} from "./season-intro.tsx";
import {StandingsTable} from "./standings-table.tsx";

// The build's data check guarantees the first index entry is a hosted season with data
const [current, ...past] = seasonIndex;
const season = seasonData[current.id];
const summary = summarizeSeason(season);
const scheduledRounds = season.plannedRounds ?? seasonRounds(season).length;
const hasResults = summary.roundsCompleted > 0;

export function LandingPage() {
	const roundTag = <RoundTag summary={summary} />;
	return (
		<>
			<SiteHeader />
			<main>
				<SeasonIntro entry={current} season={season} />
				<ChampionshipStrip season={season} summary={summary} />
				{hasResults && (
					<section id="progress" className={`page-width ${styles.section}`}>
						<SectionHeading title="Points by round" aside={roundTag} />
						<PointsChart season={season} summary={summary} />
					</section>
				)}
				<section id="standings" className={`page-width ${styles.section}`}>
					<SectionHeading title="Driver standings" aside={roundTag} />
					{hasResults ? <StandingsTable season={season} summary={summary} /> : <p className={styles.empty}>No results yet.</p>}
				</section>
				<section id="schedule" className={`page-width ${styles.section}`}>
					<SectionHeading
						title="Schedule and results"
						aside={<Tag>{summary.roundsCompleted} of {scheduledRounds} rounds completed</Tag>}
					/>
					<ScheduleResults season={season} summary={summary} />
				</section>
				<PastSeasons seasons={past} />
				<PointsExplainer season={season} summary={summary} />
			</main>
			<SiteFooter />
		</>
	);
}
