import type {SeasonData, Week} from "../data/types.ts";
import {computeStandings, countedResults, hasBeenRun, racedRounds, seasonRounds} from "./standings.ts";
import type {DriverStanding, RacedRound, Round} from "./standings.ts";

export interface RaceNight {
	number: number;
	week: Week;
	rounds: Round[];
}

export interface SeasonSummary {
	standings: DriverStanding[];
	roundsCompleted: number;
	countedResults: number | null;
	latestRound: RacedRound | null;
	// The race night after the one holding the most recent result
	nextNight: RaceNight | null;
}

export function summarizeSeason(season: SeasonData): SeasonSummary {
	const rounds = seasonRounds(season);
	const raced = racedRounds(season);
	const latestRound = raced.at(-1) ?? null;
	const nightAt = (weekIndex: number): RaceNight | null => {
		const week = season.weeks[weekIndex];
		if (!week) {
			return null;
		}
		return {number: weekIndex + 1, week, rounds: rounds.filter((round) => round.week === week)};
	};
	const latestWeekIndex = latestRound ? latestRound.weekNumber - 1 : -1;
	const completed = rounds.filter((round) => hasBeenRun(round.race)).length;
	return {
		standings: computeStandings(season),
		roundsCompleted: completed,
		countedResults: countedResults(season),
		latestRound,
		nextNight: nightAt(latestWeekIndex + 1),
	};
}
