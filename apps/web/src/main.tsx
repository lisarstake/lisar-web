import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { router } from "@/routes/router";
import { queryClient } from "@/providers/queryClient";
import "./styles/index.css";
import mixpanel from "mixpanel-browser";

// Mixpanel
const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;
if (mixpanelToken) {
  mixpanel.init(mixpanelToken, {
    debug: false,
    api_host: "https://nginx-proxy-mctg.onrender.com",
    track_pageview: true,
    persistence: "localStorage",
    autocapture: true,
    record_sessions_percent: 100,
  });
} else {
  mixpanel.init("development-placeholder", {
    debug: false,
    track_pageview: false,
    autocapture: false,
    opt_out_tracking_by_default: true,
  });
}

// Handle chunk loading errors
window.addEventListener("error", (event) => {
  if (
    event.message.includes("Failed to fetch dynamically imported module") ||
    event.message.includes("Importing a module script failed") ||
    event.message.includes("error loading dynamically imported module")
  ) {
    const hasReloaded = sessionStorage.getItem("chunk-error-reloaded");

    if (!hasReloaded) {
      sessionStorage.setItem("chunk-error-reloaded", "true");
      window.location.reload();
    } else {
      sessionStorage.removeItem("chunk-error-reloaded");
    }
  }
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
