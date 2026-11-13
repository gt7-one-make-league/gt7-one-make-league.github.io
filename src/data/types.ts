export interface FastestLap {
	driver: string;
	time: string;
}

export interface RaceResult {
	// Classified order, DNFs included at the position they were classified
	finish: string[];
	dnf: string[];
	fastestLap: FastestLap;
}

export interface Race {
	track: string;
	// Absent until the race has been run
	result?: RaceResult;
	// The race was run but its results were never recorded; it scores nothing
	resultsMissing?: boolean;
}

export interface Week {
	// Race night date (YYYY-MM-DD) in the season's race time zone
	date: string;
	// Absent until the car is announced
	car?: string;
	// The night's races in running order; empty until the tracks are announced
	races: Race[];
}

export interface RaceTime {
	// Wall-clock time, 24-hour HH:MM
	time: string;
	// IANA zone name, never a fixed offset, so daylight saving is handled per date
	timeZone: string;
}

export interface SeasonData {
	// Points by finishing position; positions past the end score 0
	points: number[];
	fastestLapBonus: number;
	droppedResults: number;
	// Season length in rounds; null until it is known
	plannedRounds: number | null;
	raceTime: RaceTime;
	weeks: Week[];
}

export interface PodiumPlace {
	driver: string;
	points: number;
}

// A season whose results live on another site
export interface ExternalSeason {
	url: string;
	rounds: number;
	countedResults: number;
	podium: PodiumPlace[];
}

export interface SeasonIndexEntry {
	id: string;
	name: string;
	title?: string;
	format: string;
	external?: ExternalSeason;
}
