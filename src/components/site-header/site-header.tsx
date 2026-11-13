import styles from "./site-header.module.css";

const navLinks = [
	{href: "/#standings", label: "Standings"},
	{href: "/#schedule", label: "Schedule"},
	{href: "/#points", label: "Points"},
];

// A 4 by 4 checkered flag tile; public/favicon.svg draws the same squares
function CheckerMark() {
	return (
		<svg className={styles.mark} viewBox="0 0 4 4" aria-hidden="true" focusable="false">
			<path d="M0 0h1v1H0zM2 0h1v1H2zM1 1h1v1H1zM3 1h1v1H3zM0 2h1v1H0zM2 2h1v1H2zM1 3h1v1H1zM3 3h1v1H3z" />
		</svg>
	);
}

export function SiteHeader() {
	return (
		<header className={styles.header}>
			<div className={`page-width ${styles.bar}`}>
				<a className={styles.brand} href="/">
					<CheckerMark />
					<span className={styles.name}>GT7 One Make League</span>
				</a>
				<nav className={styles.nav} aria-label="Main">
					{navLinks.map((link) => (
						<a key={link.href} className={styles["nav-link"]} href={link.href}>{link.label}</a>
					))}
				</nav>
			</div>
		</header>
	);
}
