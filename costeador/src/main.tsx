import { createRoot } from "react-dom/client";
import ErrorBoundary from "./components/ErrorBoundary";
import Costeador from "./pages/Costeador";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <Costeador />
  </ErrorBoundary>
);
