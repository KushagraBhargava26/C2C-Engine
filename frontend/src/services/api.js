import axios from "axios";
import { getMockIncidentsPage } from "../data/mockIncidents.js";
import { getMockHeatmap } from "../data/mockHeatmap.js";

// --- Mode switch -----------------------------------------------------------
// Change this to false once your friend's Spring Boot endpoints are live.
// This is the ONE line the whole app depends on for the mock -> real swap.
const USE_MOCK = true;
const BASE_URL = "http://localhost:8080";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

// Simulates network latency in mock mode, so loading states are actually
// visible and testable before the real backend exists.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeError(err) {
  if (err.response?.data) {
    return err.response.data;
  }
  return {
    status: err.response?.status ?? 0,
    error: err.code === "ECONNABORTED" ? "Timeout" : "Network Error",
    message: err.message || "The backend is unreachable.",
  };
}

/**
 * GET /api/v1/incidents?page=&size=
 */
export async function getIncidents({ page = 0, size = 20 } = {}) {
  if (USE_MOCK) {
    await wait(400);
    return getMockIncidentsPage({ page, size });
  }
  try {
    const { data } = await client.get("/api/v1/incidents", { params: { page, size } });
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * GET /api/v1/exposure/heatmap
 */
export async function getHeatmap() {
  if (USE_MOCK) {
    await wait(500);
    return getMockHeatmap();
  }
  try {
    const { data } = await client.get("/api/v1/exposure/heatmap");
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export const apiConfig = { USE_MOCK, BASE_URL };
