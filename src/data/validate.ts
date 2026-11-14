import {hasBeenRun} from "../standings/standings.ts";
import {knownDrivers, seasonData, seasonIndex} from "./seasons.ts";
import type {ExternalSeason, Race, RaceResult, SeasonData, SeasonIndexEntry} from "./types.ts";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const lapTimePattern = /^\d{1,2}:[0-5]\d\.\d{3}$/;

// Every problem in the data files, as readable messages; empty when the data is consistent
export function checkAllData(): string[] {
	const known = new Set(knownDrivers);
	return [
		...checkDriverList(knownDrivers),
		...checkSeasonIndex(seasonIndex, seasonData),
		...Object.entries(seasonData).flatMap(([id, season]) => checkSeason(id, season, known)),
	];
}

function duplicates(values: string[]): string[] {
	return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function isWholeNumber(value: unknown, minimum: number): boolean {
	return typeof value === "number" && Number.isInteger(value) && value >= minimum;
}

function checkDriverList(drivers: string[]): string[] {
	const lowered = drivers.map((driver) => driver.toLowerCase());
	return duplicates(lowered).map((name) => `drivers.json: "${name}" is listed more than once (case ignored)`);
}

function checkSeasonIndex(index: SeasonIndexEntry[], data: Record<string, SeasonData>): string[] {
	const problems: string[] = [];
	if (index.length === 0 || index[0].external) {
		problems.push("seasons.json: the first entry must be the current season, hosted on this site");
	}
	for (const id of duplicates(index.map((entry) => entry.id))) {
		problems.push(`seasons.json: id "${id}" is used more than once`);
	}
	for (const entry of index) {
		if (entry.external) {
			problems.push(...checkExternalSeason(entry.id, entry.external));
		} else if (!data[entry.id]) {
			problems.push(`seasons.json: "${entry.id}" has no data file registered in src/data/seasons.ts`);
		}
	}
	for (const id of Object.keys(data)) {
		if (!index.some((entry) => entry.id === id && !entry.external)) {
			problems.push(`src/data/seasons.ts: "${id}" is not a hosted season in seasons.json`);
		}
	}
	return problems;
}

function checkExternalSeason(id: string, external: ExternalSeason): string[] {
	const problems: string[] = [];
	if (!external.url.startsWith("https://")) {
		problems.push(`seasons.json "${id}": url must start with https://`);
	}
	if (!isWholeNumber(external.rounds, 1) || !isWholeNumber(external.countedResults, 1) || external.countedResults > external.rounds) {
		problems.push(`seasons.json "${id}": rounds and countedResults must be whole numbers, countedResults no more than rounds`);
	}
	if (external.podium.length === 0) {
		problems.push(`seasons.json "${id}": podium is empty`);
	}
	return problems;
}

interface LabeledRace {
	label: string;
	race: Race;
}

// Each scheduled race with a "season-2 week 1, round 2 (Track)" label for messages
function labeledRaces(id: string, season: SeasonData): LabeledRace[] {
	return season.weeks
		.flatMap((week, weekIndex) => week.races.map((race) => ({race, week: weekIndex + 1})))
		.map(({race, week}, index) => ({race, label: `${id} week ${week}, round ${index + 1} (${race.track})`}));
}

export function checkSeason(id: string, season: SeasonData, known: Set<string>): string[] {
	const races = labeledRaces(id, season);
	return [
		...checkScoring(id, season, races.length),
		...checkSchedule(id, season),
		...checkResultOrder(races),
		...races.flatMap(({label, race}) => checkRace(label, race, known)),
	];
}

function checkScoring(id: string, season: SeasonData, scheduled: number): string[] {
	const problems: string[] = [];
	const descending = season.points.every((value, index) => index === 0 || value <= season.points[index - 1]);
	if (season.points.length === 0 || !season.points.every((value) => isWholeNumber(value, 0)) || !descending) {
		problems.push(`${id}: points must be whole numbers, highest first`);
	}
	if (!isWholeNumber(season.fastestLapBonus, 0) || !isWholeNumber(season.droppedResults, 0)) {
		problems.push(`${id}: fastestLapBonus and droppedResults must be whole numbers`);
	}
	if (season.plannedRounds !== null && (!isWholeNumber(season.plannedRounds, season.droppedResults + 1) || scheduled > season.plannedRounds)) {
		problems.push(`${id}: plannedRounds must be more than droppedResults and at least the ${scheduled} rounds scheduled`);
	}
	return problems;
}

function isRealDate(date: string): boolean {
	if (!datePattern.test(date)) {
		return false;
	}
	const [year, month, day] = date.split("-").map(Number);
	const parsed = new Date(Date.UTC(year, month - 1, day));
	return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function isTimeZone(timeZone: string): boolean {
	try {
		new Intl.DateTimeFormat("en-US", {timeZone});
		return true;
	} catch {
		return false;
	}
}

function checkSchedule(id: string, season: SeasonData): string[] {
	const problems: string[] = [];
	if (!timePattern.test(season.raceTime.time) || !isTimeZone(season.raceTime.timeZone)) {
		problems.push(`${id}: raceTime needs a 24-hour HH:MM time and an IANA time zone name`);
	}
	for (const [index, week] of season.weeks.entries()) {
		const label = `${id} week ${index + 1}`;
		if (!isRealDate(week.date)) {
			problems.push(`${label}: date "${week.date}" is not a real YYYY-MM-DD date`);
		} else if (index > 0 && week.date <= season.weeks[index - 1].date) {
			problems.push(`${label}: date must be later than the week before`);
		}
	}
	return problems;
}

// Races are run in order, so no race is run after one that has not been
function checkResultOrder(races: LabeledRace[]): string[] {
	const firstPending = races.findIndex(({race}) => !hasBeenRun(race));
	if (firstPending < 0) {
		return [];
	}
	return races.slice(firstPending + 1)
		.filter(({race}) => hasBeenRun(race))
		.map(({label}) => `${label}: has results, but an earlier race is neither run nor marked resultsMissing`);
}

function checkRace(label: string, race: Race, known: Set<string>): string[] {
	const problems = race.track.trim() === "" ? [`${label}: needs a track`] : [];
	if (race.result && race.resultsMissing) {
		problems.push(`${label}: has results and is also marked resultsMissing`);
	}
	return race.result ? [...problems, ...checkResult(label, race.result, known)] : problems;
}

function checkResult(label: string, result: RaceResult, known: Set<string>): string[] {
	const problems: string[] = [];
	if (result.finish.length === 0) {
		problems.push(`${label}: the finishing order is empty`);
	}
	for (const name of duplicates(result.finish)) {
		problems.push(`${label}: "${name}" appears more than once in the finishing order`);
	}
	for (const name of result.finish.filter((driver) => !known.has(driver))) {
		problems.push(`${label}: unknown driver "${name}"; fix the spelling, or add a new driver to data/drivers.json`);
	}
	for (const name of result.dnf.filter((driver) => !result.finish.includes(driver))) {
		problems.push(`${label}: DNF "${name}" is not in the finishing order`);
	}
	if (!result.finish.includes(result.fastestLap.driver)) {
		problems.push(`${label}: fastest lap driver "${result.fastestLap.driver}" is not in the finishing order`);
	}
	if (result.fastestLap.time !== undefined && !lapTimePattern.test(result.fastestLap.time)) {
		problems.push(`${label}: fastest lap time "${result.fastestLap.time}" should look like 1:23.456`);
	}
	return problems;
}
