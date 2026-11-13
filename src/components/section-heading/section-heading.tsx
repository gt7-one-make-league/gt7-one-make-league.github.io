import type {ReactNode} from "react";
import styles from "./section-heading.module.css";

interface SectionHeadingProps {
	title: string;
	aside?: ReactNode;
}

export function SectionHeading({title, aside}: SectionHeadingProps) {
	return (
		<div className={styles.heading}>
			<h2 className={styles.title}>{title}</h2>
			{aside}
		</div>
	);
}
