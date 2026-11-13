import type {ReactNode} from "react";
import styles from "./tag.module.css";

// A small neutral label beside a heading
export function Tag({children}: {children: ReactNode}) {
	return <span className={styles.tag}>{children}</span>;
}
