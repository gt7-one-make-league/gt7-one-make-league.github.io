import {describe, expect, it} from "vitest";
import type {RaceTime} from "../data/types.ts";
import {formatDay, formatTime, raceInstant, zoneName} from "./race-time.ts";

const pacific: RaceTime = {time: "19:30", timeZone: "America/Los_Angeles"};

describe("raceInstant", () => {
	it("converts a standard-time date (UTC-8)", () => {
		expect(raceInstant("2026-11-19", pacific).toISOString()).toBe("2026-11-20T03:30:00.000Z");
	});

	it("converts a daylight-time date (UTC-7)", () => {
		expect(raceInstant("2026-07-09", pacific).toISOString()).toBe("2026-07-10T02:30:00.000Z");
	});

	it("uses daylight time after the change on the day it starts", () => {
		// US daylight saving starts 2026-03-08 at 2:00 AM
		expect(raceInstant("2026-03-08", pacific).toISOString()).toBe("2026-03-09T02:30:00.000Z");
	});

	it("uses standard time before the change on that same day", () => {
		expect(raceInstant("2026-03-08", {...pacific, time: "01:30"}).toISOString()).toBe("2026-03-08T09:30:00.000Z");
	});
});

describe("formatting", () => {
	const instant = raceInstant("2026-11-19", pacific);

	it("shows the day in the given zone, rolling over where it is already tomorrow", () => {
		expect(formatDay(instant, "America/Los_Angeles")).toBe("Thursday, November 19");
		expect(formatDay(instant, "Europe/London")).toBe("Friday, November 20");
	});

	it("shows the time in the given zone", () => {
		// Intl may separate the time and AM/PM with a narrow no-break space
		expect(formatTime(instant, "America/New_York")).toMatch(/^10:30\sPM$/);
	});

	it("names the zone generically", () => {
		expect(zoneName(instant, "America/Los_Angeles")).toBe("Pacific Time");
	});
});
