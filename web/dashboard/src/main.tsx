import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TenantLayout } from "./layout/tenant-layout";
import { LoginPage } from "./pages/login";
import { ConnectionsPage } from "./pages/connections";
import { EventsPage } from "./pages/events";
import { HistoryPage } from "./pages/history";
import { ApiKeyPage } from "./pages/api-key";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/t/:tenantId" element={<TenantLayout />}>
          <Route index element={<Navigate to="connections" replace />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="api-key" element={<ApiKeyPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
