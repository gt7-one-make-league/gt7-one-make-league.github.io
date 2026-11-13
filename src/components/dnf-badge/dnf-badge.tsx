import styles from "./dnf-badge.module.css";

// Marks a did-not-finish; spacing around it belongs to the context it sits in
export function DnfBadge({className = ""}: {className?: string}) {
	return <span className={`${styles.badge} ${className}`}>DNF</span>;
}
