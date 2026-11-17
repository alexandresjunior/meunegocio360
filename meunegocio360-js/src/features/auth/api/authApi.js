import { apiRequest } from "../../../shared/lib/http.js";
import { parseLoginResponse } from "./authSchema.js";

let refreshInFlight = null;

export async function login(credentials) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
    auth: false,
    retryOnUnauthorized: false,
  });

  return parseLoginResponse(response);
}

export function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = apiRequest("/auth/refresh", {
      method: "POST",
      auth: false,
      retryOnUnauthorized: false,
    })
      .then(parseLoginResponse)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

export function logout() {
  return apiRequest("/auth/logout", {
    method: "POST",
    auth: false,
    retryOnUnauthorized: false,
  });
}
