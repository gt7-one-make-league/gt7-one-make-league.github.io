import type {RaceTime} from "../data/types.ts";
import {dot} from "../text/text.ts";

export interface RaceTimeLines {
	// "Thursday, November 19", in the league's zone
	day: string;
	// "7:30 PM Pacific Time"
	time: string;
	// The viewer's own time when it differs: "10:30 PM EST", or "Friday, November 20 · 3:30 AM GMT" when the day differs too
	local: string | null;
}

// The zone's UTC offset in milliseconds at an instant (negative west of UTC)
function zoneOffset(instant: number, timeZone: string): number {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		hourCycle: "h23",
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
	}).formatToParts(new Date(instant));
	const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value);
	const asUtc = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
	return asUtc - instant;
}

// The instant a race night starts, from its date and the season's wall-clock time and zone
export function raceInstant(date: string, raceTime: RaceTime): Date {
	const [year, month, day] = date.split("-").map(Number);
	const [hour, minute] = raceTime.time.split(":").map(Number);
	const wallClock = Date.UTC(year, month - 1, day, hour, minute);
	// Second pass corrects the offset when the first guess lands across a daylight saving change
	const firstGuess = wallClock - zoneOffset(wallClock, raceTime.timeZone);
	return new Date(wallClock - zoneOffset(firstGuess, raceTime.timeZone));
}

// "Thursday, November 19" in the given zone (the viewer's own when omitted)
export function formatDay(instant: Date, timeZone?: string): string {
	return new Intl.DateTimeFormat("en-US", {weekday: "long", month: "long", day: "numeric", timeZone}).format(instant);
}

// "7:30 PM", or "10:30 PM EST" with the zone's short name
export function formatTime(instant: Date, timeZone?: string, withZoneName = false): string {
	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
		timeZone,
		timeZoneName: withZoneName ? "short" : undefined,
	}).format(instant);
}

export function formatWeekday(instant: Date, timeZone: string): string {
	return new Intl.DateTimeFormat("en-US", {weekday: "long", timeZone}).format(instant);
}

// League time for a race night, plus the viewer's own time when their zone shows a different day or time
export function raceTimeLines(date: string, raceTime: RaceTime): RaceTimeLines {
	const {timeZone} = raceTime;
	const instant = raceInstant(date, raceTime);
	const day = formatDay(instant, timeZone);
	const time = formatTime(instant, timeZone);
	const localDay = formatDay(instant);
	const sameDay = localDay === day;
	const sameTime = sameDay && formatTime(instant) === time;
	return {
		day,
		time: `${time} ${zoneName(instant, timeZone)}`,
		local: sameTime ? null : `${sameDay ? "" : `${localDay}${dot}`}${formatTime(instant, undefined, true)}`,
	};
}

// "Pacific Time" for America/Los_Angeles
export function zoneName(instant: Date, timeZone: string): string {
	const parts = new Intl.DateTimeFormat("en-US", {timeZone, timeZoneName: "longGeneric"}).formatToParts(instant);
	return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}
