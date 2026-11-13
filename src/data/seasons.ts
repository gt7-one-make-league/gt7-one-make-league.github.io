import driversJson from "../../data/drivers.json" with {type: "json"};
import season2Json from "../../data/season-2.json" with {type: "json"};
import seasonIndexJson from "../../data/seasons.json" with {type: "json"};
import type {SeasonData, SeasonIndexEntry} from "./types.ts";

// Every driver name the results may use; a new driver is added here deliberately
export const knownDrivers: string[] = driversJson;

// Newest season first; the first entry is the current season
export const seasonIndex: SeasonIndexEntry[] = seasonIndexJson;

// Results for each season hosted on this site, keyed by its seasons.json id
export const seasonData: Record<string, SeasonData> = {
	"season-2": season2Json,
};
