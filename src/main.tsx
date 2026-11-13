import {StrictMode} from "react";
import {createRoot} from "react-dom/client";

const appElement = document.getElementById("app");
if (!appElement) {
	throw new Error("Missing #app element");
}

createRoot(appElement).render(
	<StrictMode>
		<h1>GT7 One-Make League</h1>
	</StrictMode>,
);
