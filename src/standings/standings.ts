import type {Race, RaceResult, SeasonData, Week} from "../data/types.ts";

export interface Round {
	number: number;
	weekNumber: number;
	week: Week;
	race: Race;
}

export interface RacedRound extends Round {
	result: RaceResult;
}

// One driver's outcome in one raced round
export interface RoundScore {
	round: number;
	// Null when the driver did not start
	points: number | null;
	dnf: boolean;
	fastestLap: boolean;
	// Whether it is among the results that count toward the championship
	counted: boolean;
}

export interface DriverRow {
	driver: string;
	// Official championship points: the counted results only
	points: number;
	// Every result added up
	total: number;
	starts: number;
	scores: RoundScore[];
}

export interface DriverStanding extends DriverRow {
	position: number;
	tied: boolean;
}

// Every scheduled race in running order, numbered whether or not it has been run
export function seasonRounds(season: SeasonData): Round[] {
	const rounds: Round[] = [];
	for (const [weekIndex, week] of season.weeks.entries()) {
		for (const race of week.races) {
			rounds.push({number: rounds.length + 1, weekNumber: weekIndex + 1, week, race});
		}
	}
	return rounds;
}

// Rounds with recorded results; a round run without recorded results is skipped
export function racedRounds(season: SeasonData): RacedRound[] {
	const raced: RacedRound[] = [];
	for (const round of seasonRounds(season)) {
		if (round.race.result) {
			raced.push({...round, result: round.race.result});
		}
	}
	return raced;
}

// Whether a race has happened: it has results, or it ran and its results were never recorded
export function hasBeenRun(race: Race): boolean {
	return race.result !== undefined || race.resultsMissing === true;
}

// Whether a driver set the fastest lap and finished, which is what earns the bonus
export function earnedFastestLap(result: RaceResult, driver: string): boolean {
	return result.fastestLap.driver === driver && !result.dnf.includes(driver);
}

// Points for the finishing position alone: 0 for a DNF, null when the driver did not start
export function positionPoints(season: SeasonData, result: RaceResult, driver: string): number | null {
	const position = result.finish.indexOf(driver);
	if (position < 0) {
		return null;
	}
	if (result.dnf.includes(driver)) {
		return 0;
	}
	return season.points[position] ?? 0;
}

export function lapBonus(season: SeasonData, result: RaceResult, driver: string): number {
	return earnedFastestLap(result, driver) ? season.fastestLapBonus : 0;
}

// Points for one driver in one race, or null when they did not start it
export function racePoints(season: SeasonData, result: RaceResult, driver: string): number | null {
	const points = positionPoints(season, result, driver);
	return points === null ? null : points + lapBonus(season, result, driver);
}

// How many results count toward the championship, or null until the season length is known
export function countedResults(season: SeasonData): number | null {
	if (season.plannedRounds === null) {
		return null;
	}
	return season.plannedRounds - season.droppedResults;
}

function sum(values: number[]): number {
	return values.reduce((total, value) => total + value, 0);
}

// Marks the best results as counted; equal results favor the earlier round.
// Missed rounds score 0, so the best results among starts are the best among all rounds.
function markCounted(scores: RoundScore[], keep: number | null): RoundScore[] {
	const ranked = scores
		.filter((score) => score.points !== null)
		.sort((a, b) => (b.points ?? 0) - (a.points ?? 0) || a.round - b.round);
	const kept = new Set((keep === null ? ranked : ranked.slice(0, keep)).map((score) => score.round));
	return scores.map((score) => ({...score, counted: kept.has(score.round)}));
}

function driverRow(season: SeasonData, raced: RacedRound[], driver: string, keep: number | null): DriverRow {
	const scores = markCounted(raced.map((round) => ({
		round: round.number,
		points: racePoints(season, round.result, driver),
		dnf: round.result.dnf.includes(driver),
		fastestLap: earnedFastestLap(round.result, driver),
		counted: false,
	})), keep);
	const started = scores.filter((score) => score.points !== null);
	return {
		driver,
		points: sum(started.filter((score) => score.counted).map((score) => score.points ?? 0)),
		total: sum(started.map((score) => score.points ?? 0)),
		starts: started.length,
		scores,
	};
}

// Orders rows by a value; equal values share a position, listed by name
export function rankStandings(rows: DriverRow[], value: (row: DriverRow) => number): DriverStanding[] {
	const sorted = [...rows].sort((a, b) => value(b) - value(a) || a.driver.localeCompare(b.driver));
	return sorted.map((row) => ({
		...row,
		position: 1 + sorted.filter((other) => value(other) > value(row)).length,
		tied: sorted.filter((other) => value(other) === value(row)).length > 1,
	}));
}

// Official standings after the given number of rounds (all raced rounds by default)
export function computeStandings(season: SeasonData, throughRound = Infinity): DriverStanding[] {
	const raced = racedRounds(season).filter((round) => round.number <= throughRound);
	const drivers = [...new Set(raced.flatMap((round) => round.result.finish))];
	const keep = countedResults(season);
	const rows = drivers.map((driver) => driverRow(season, raced, driver, keep));
	return rankStandings(rows, (row) => row.points);
}
