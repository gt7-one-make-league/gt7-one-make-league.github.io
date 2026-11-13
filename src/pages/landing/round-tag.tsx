import {Tag} from "../../components/tag/tag.tsx";
import type {SeasonSummary} from "../../standings/season-summary.ts";

// "After round 6" beside a section heading
export function RoundTag({summary}: {summary: SeasonSummary}) {
	if (summary.roundsCompleted === 0) {
		return null;
	}
	return <Tag>After round {summary.roundsCompleted}</Tag>;
}
