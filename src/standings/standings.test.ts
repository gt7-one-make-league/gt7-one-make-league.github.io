import {describe, expect, it} from "vitest";
import type {Race, RaceResult, SeasonData} from "../data/types.ts";
import {summarizeSeason} from "./season-summary.ts";
import {computeStandings, hasBeenRun, racePoints} from "./standings.ts";

function result(finish: string[], fastest: string, dnf: string[] = []): RaceResult {
	return {finish, dnf, fastestLap: {driver: fastest, time: "1:23.456"}};
}

function race(finish: string[], fastest: string, dnf: string[] = []): Race {
	return {track: "Test Track", result: result(finish, fastest, dnf)};
}

function season(races: Race[], plannedRounds: number | null = null, droppedResults = 0): SeasonData {
	return {
		points: [25, 20, 16],
		fastestLapBonus: 1,
		droppedResults,
		plannedRounds,
		raceTime: {time: "19:30", timeZone: "America/Los_Angeles"},
		weeks: [{date: "2026-11-05", races}],
	};
}

function standing(data: SeasonData, driver: string, throughRound?: number) {
	return computeStandings(data, throughRound).find((row) => row.driver === driver);
}

describe("racePoints", () => {
	const data = season([]);
	const race1 = result(["A", "B", "C", "D"], "B", ["C"]);

	it("scores the finishing position from the points table", () => {
		expect(racePoints(data, race1, "A")).toBe(25);
	});

	it("adds the fastest-lap bonus", () => {
		expect(racePoints(data, race1, "B")).toBe(21);
	});

	it("scores a DNF as 0", () => {
		expect(racePoints(data, race1, "C")).toBe(0);
	});

	it("scores 0 past the end of the points table", () => {
		expect(racePoints(data, race1, "D")).toBe(0);
	});

	it("returns null for a driver who did not start", () => {
		expect(racePoints(data, race1, "E")).toBeNull();
	});

	it("gives no bonus to a DNF who set the fastest lap", () => {
		expect(racePoints(data, result(["A", "B"], "B", ["B"]), "B")).toBe(0);
	});
});

describe("computeStandings", () => {
	it("gives equal points a shared position, listed by name", () => {
		const rows = computeStandings(season([race(["B", "A", "C"], "B"), race(["A", "B"], "A")]));
		expect(rows.map((row) => [row.driver, row.position, row.tied])).toEqual([
			["A", 1, true],
			["B", 1, true],
			["C", 3, false],
		]);
	});

	it("counts only the best results once the season length is known", () => {
		// 3 planned rounds, 1 dropped: the best 2 count
		const data = season([race(["A"], "A"), race(["A", "B"], "B"), race(["B", "A"], "A")], 3, 1);
		const a = standing(data, "A");
		expect(a?.total).toBe(26 + 25 + 21);
		expect(a?.points).toBe(26 + 25);
		expect(a?.scores.map((score) => score.counted)).toEqual([true, true, false]);
	});

	it("keeps the earlier round when dropped results are equal", () => {
		const data = season([race(["A", "B"], "B"), race(["A", "B"], "B")], 2, 1);
		expect(standing(data, "A")?.scores.map((score) => score.counted)).toEqual([true, false]);
	});

	it("counts every result while the season length is unknown", () => {
		const data = season([race(["A"], "A"), race(["A"], "A"), race(["A"], "A")], null, 1);
		expect(standing(data, "A")?.points).toBe(78);
	});

	it("can stop after a given round", () => {
		const data = season([race(["A", "B"], "A"), race(["B", "A"], "B")]);
		expect(standing(data, "B", 1)?.points).toBe(20);
	});

	it("skips a round whose results were never recorded", () => {
		const data = season([{track: "Lost Track", resultsMissing: true}, race(["A"], "A")]);
		expect(standing(data, "A")?.scores.map((score) => score.round)).toEqual([2]);
	});
});

describe("race status", () => {
	it("treats a race with missing results as run, and a scheduled one as not", () => {
		expect(hasBeenRun({track: "Lost Track", resultsMissing: true})).toBe(true);
		expect(hasBeenRun({track: "Next Track"})).toBe(false);
	});

	it("counts a race with missing results as completed in the summary", () => {
		const data = season([{track: "Lost Track", resultsMissing: true}, race(["A"], "A"), {track: "Next Track"}]);
		const summary = summarizeSeason(data);
		expect(summary.roundsCompleted).toBe(2);
		expect(summary.latestRound?.number).toBe(2);
	});
});
