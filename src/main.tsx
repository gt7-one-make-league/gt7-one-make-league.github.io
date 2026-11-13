import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {LandingPage} from "./pages/landing/landing-page.tsx";
import "./styles/global.css";

const appElement = document.getElementById("app");
if (!appElement) {
	throw new Error("Missing #app element");
}

createRoot(appElement).render(
	<StrictMode>
		<LandingPage />
	</StrictMode>,
);
