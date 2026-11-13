import type {ReactNode} from "react";
import styles from "./card.module.css";

interface CardProps {
	children: ReactNode;
	variant?: "solid" | "dashed";
	className?: string;
}

export function Card({children, variant = "solid", className = ""}: CardProps) {
	return (
		<div className={`${styles.card} ${styles[variant]} ${className}`}>
			{children}
		</div>
	);
}
