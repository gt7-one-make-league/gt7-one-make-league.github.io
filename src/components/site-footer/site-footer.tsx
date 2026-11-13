import styles from "./site-footer.module.css";

export function SiteFooter() {
	return (
		<footer className={styles.footer}>
			<div className={`page-width ${styles.bar}`}>
				<span className={styles.name}>GT7 One Make League</span>
				<span>An independent league, not affiliated with Sony Interactive Entertainment or Polyphony Digital.</span>
			</div>
		</footer>
	);
}
