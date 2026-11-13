import {useEffect, useState} from "react";
import type {RefObject} from "react";

// Tracks an element's content width, so an SVG can draw at real pixel size
export function useElementWidth(ref: RefObject<HTMLElement | null>, fallback: number): number {
	const [width, setWidth] = useState(fallback);
	useEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}
		const observer = new ResizeObserver((entries) => {
			const entry = entries.at(0);
			if (entry) {
				setWidth(Math.round(entry.contentRect.width));
			}
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [ref]);
	return width;
}
