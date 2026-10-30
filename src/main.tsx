import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

const appName = import.meta.env.VITE_APP_NAME ?? "Rekapan Narsum DIT TSI";
document.title = `Admin ${appName}`;

const container = document.getElementById("root");
if (!container) throw new Error('Elemen #root tidak ditemukan di index.html');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
