const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";

if (!configuredBaseUrl.startsWith("/") || configuredBaseUrl.startsWith("//")) {
  throw new Error(
    "VITE_API_BASE_URL deve ser um caminho relativo, como /api/v1.",
  );
}

const apiBaseUrl = configuredBaseUrl.replace(/\/+$/, "");
const requestTimeoutMs = 10_000;
let sessionHandlers = {};
let refreshInFlight = null;

export class ApiError extends Error {
  constructor({ status, code, detail, errors = [], retryAfter = null }) {
    super(detail || "A solicitação não pôde ser concluída.");
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.errors = errors;
    this.retryAfter = retryAfter;
  }
}

export function configureHttpSession(handlers) {
  sessionHandlers = handlers || {};
}

function createRequestId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toApiError(response, payload) {
  const retryAfterValue = response.headers.get("Retry-After");
  const retryAfter =
    retryAfterValue && /^\d+$/.test(retryAfterValue)
      ? Number(retryAfterValue)
      : null;

  return new ApiError({
    status: response.status,
    code: payload?.code || `HTTP_${response.status}`,
    detail: payload?.detail,
    errors: Array.isArray(payload?.errors) ? payload.errors : [],
    retryAfter,
  });
}

async function fetchResponse(path, options, accessToken, requestId) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    requestTimeoutMs,
  );
  const externalSignal = options.signal;
  const abortFromCaller = () => controller.abort(externalSignal.reason);

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener("abort", abortFromCaller, { once: true });
    }
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json, application/problem+json");
  headers.set("X-Request-Id", requestId);

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    return await fetch(`${apiBaseUrl}${path}`, {
      method: options.method || "GET",
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: "include",
      signal: controller.signal,
    });
  } catch (error) {
    if (externalSignal?.aborted) {
      throw error;
    }

    if (controller.signal.aborted) {
      throw new ApiError({
        status: 0,
        code: "REQUEST_TIMEOUT",
        detail: "A solicitação excedeu o tempo limite.",
      });
    }

    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      detail: "Não foi possível conectar à API.",
    });
  } finally {
    window.clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abortFromCaller);
  }
}

async function readResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new ApiError({
      status: response.status,
      code: "INVALID_RESPONSE",
      detail: "A API retornou uma resposta inválida.",
    });
  }
}

function refreshSession() {
  if (!refreshInFlight) {
    if (typeof sessionHandlers.refresh !== "function") {
      return Promise.reject(
        new ApiError({
          status: 401,
          code: "UNAUTHORIZED",
          detail: "A sessão não está disponível.",
        }),
      );
    }

    refreshInFlight = Promise.resolve()
      .then(() => sessionHandlers.refresh())
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

async function request(path, options, requestId, retried) {
  const tokenBeforeRequest = options.auth
    ? sessionHandlers.getAccessToken?.() || null
    : null;
  const response = await fetchResponse(
    path,
    options,
    tokenBeforeRequest,
    requestId,
  );
  const payload = await readResponse(response);

  if (response.ok) {
    return payload;
  }

  const apiError = toApiError(response, payload);
  if (!options.auth || options.retryOnUnauthorized === false || retried) {
    throw apiError;
  }

  if (response.status !== 401) {
    throw apiError;
  }

  const currentToken = sessionHandlers.getAccessToken?.() || null;
  try {
    if (!tokenBeforeRequest || currentToken === tokenBeforeRequest) {
      await refreshSession();
    }
  } catch (refreshError) {
    sessionHandlers.onSessionExpired?.(refreshError);
    throw refreshError;
  }

  return request(path, options, requestId, true);
}

export function apiRequest(path, options = {}) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("O caminho da API deve ser relativo e começar com /.");
  }

  return request(
    path,
    {
      auth: options.auth !== false,
      retryOnUnauthorized: options.retryOnUnauthorized !== false,
      method: options.method,
      body: options.body,
      headers: options.headers,
      signal: options.signal,
    },
    createRequestId(),
    false,
  );
}
