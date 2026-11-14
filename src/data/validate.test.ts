import {describe, expect, it} from "vitest";
import type {Race, SeasonData} from "./types.ts";
import {checkAllData, checkSeason} from "./validate.ts";

const known = new Set(["A", "B", "C"]);

function race(overrides: Partial<Race["result"]> = {}): Race {
	return {
		track: "Test Track",
		result: {finish: ["A", "B", "C"], dnf: [], fastestLap: {driver: "A", time: "1:23.456"}, ...overrides},
	};
}

function season(races: Race[], overrides: Partial<SeasonData> = {}): SeasonData {
	return {
		points: [25, 20, 16],
		fastestLapBonus: 1,
		droppedResults: 0,
		plannedRounds: null,
		raceTime: {time: "19:30", timeZone: "America/Los_Angeles"},
		weeks: [{date: "2026-11-05", races}],
		...overrides,
	};
}

function problems(races: Race[], overrides: Partial<SeasonData> = {}): string[] {
	return checkSeason("test", season(races, overrides), known);
}

describe("checkAllData", () => {
	it("accepts the committed data", () => {
		expect(checkAllData()).toEqual([]);
	});
});

describe("checkSeason", () => {
	it("accepts a clean season", () => {
		expect(problems([race(), {track: "Next Track"}])).toEqual([]);
	});

	it("flags an unknown driver", () => {
		expect(problems([race({finish: ["A", "Z"]})])).toEqual([expect.stringContaining('unknown driver "Z"')]);
	});

	it("flags a driver listed twice", () => {
		expect(problems([race({finish: ["A", "B", "A"]})])).toEqual([expect.stringContaining('"A" appears more than once')]);
	});

	it("flags a DNF who is not in the finishing order", () => {
		expect(problems([race({dnf: ["Z"]})])).toEqual([expect.stringContaining('DNF "Z"')]);
	});

	it("flags a fastest lap by someone who is not in the finishing order", () => {
		expect(problems([race({fastestLap: {driver: "Z", time: "1:23.456"}})])).toEqual([expect.stringContaining('fastest lap driver "Z"')]);
	});

	it("flags a malformed lap time", () => {
		expect(problems([race({fastestLap: {driver: "A", time: "83.4"}})])).toEqual([expect.stringContaining('"83.4" should look like')]);
	});

	it("accepts a fastest lap without a time", () => {
		expect(problems([race({fastestLap: {driver: "A"}})])).toEqual([]);
	});

	it("flags results after a race that has not been run", () => {
		expect(problems([{track: "Next Track"}, race()])).toEqual([expect.stringContaining("earlier race is neither run")]);
	});

	it("accepts results after a race whose results are missing", () => {
		expect(problems([{track: "Lost Track", resultsMissing: true}, race()])).toEqual([]);
	});

	it("flags a race that has results and is also marked missing", () => {
		expect(problems([{...race(), resultsMissing: true}])).toEqual([expect.stringContaining("also marked resultsMissing")]);
	});

	it("flags an unknown time zone", () => {
		const raceTime = {time: "19:30", timeZone: "Pacific"};
		expect(problems([race()], {raceTime})).toEqual([expect.stringContaining("IANA time zone")]);
	});

	it("flags more scheduled rounds than the season length", () => {
		expect(problems([race(), race()], {plannedRounds: 1})).toEqual([expect.stringContaining("plannedRounds")]);
	});
});
