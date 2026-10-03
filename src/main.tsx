import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import "./globals.css";
import "./i18n"; // Initialize i18n

// Final safety net: if anything outside the per-route boundaries throws, the
// user still gets a recovery screen instead of an empty black page.
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);