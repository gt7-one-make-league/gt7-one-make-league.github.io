// Middle dot separator between short phrases
export const dot = " · ";

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
	return `${count} ${count === 1 ? singular : plural}`;
}

export function ordinal(value: number): string {
	const lastTwo = value % 100;
	if (lastTwo >= 11 && lastTwo <= 13) {
		return `${value}th`;
	}
	const suffixes: Record<number, string> = {1: "st", 2: "nd", 3: "rd"};
	return `${value}${suffixes[value % 10] ?? "th"}`;
}
