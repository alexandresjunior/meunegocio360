import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import { ApiError, configureHttpSession } from "../../shared/lib/http.js";
import {
  login,
  logout as requestLogout,
  refreshSession,
} from "./api/authApi.js";
import { AuthContext } from "./authContext.js";

function anonymousState() {
  return { status: "anonymous", user: null, expiresIn: 0, error: null };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    status: "loading",
    user: null,
    expiresIn: 0,
    error: null,
  });
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const accessTokenRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const setAuthenticated = useCallback((session) => {
    accessTokenRef.current = session.accessToken;
    setAuth({
      status: "authenticated",
      user: session.usuario,
      expiresIn: session.expiresIn,
      error: null,
    });
  }, []);

  const clearSession = useCallback(() => {
    accessTokenRef.current = null;
    queryClient.clear();
    setAuth(anonymousState());
  }, [queryClient]);

  const handleSessionExpired = useCallback(() => {
    const from = {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    };
    clearSession();
    navigate("/login", {
      replace: true,
      state: {
        from,
        message: "Sua sessão expirou. Entre novamente.",
      },
    });
  }, [clearSession, navigate]);

  const refreshForHttp = useCallback(async () => {
    const session = await refreshSession();
    setAuthenticated(session);
    return session.accessToken;
  }, [setAuthenticated]);

  useEffect(() => {
    configureHttpSession({
      getAccessToken: () => accessTokenRef.current,
      refresh: refreshForHttp,
      onSessionExpired: handleSessionExpired,
    });

    return () => configureHttpSession(null);
  }, [handleSessionExpired, refreshForHttp]);

  useEffect(() => {
    let active = true;
    accessTokenRef.current = null;

    refreshSession()
      .then((session) => {
        if (active) {
          setAuthenticated(session);
        }
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          return;
        }

        setAuth({
          status: "unavailable",
          user: null,
          expiresIn: 0,
          error,
        });
      });

    return () => {
      active = false;
    };
  }, [clearSession, restoreAttempt, setAuthenticated]);

  useEffect(() => {
    if (auth.status !== "authenticated") {
      return undefined;
    }

    const delay = Math.max(1000, (auth.expiresIn - 60) * 1000);
    const timeoutId = window.setTimeout(() => {
      refreshForHttp().catch(() => handleSessionExpired());
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [auth.expiresIn, auth.status, handleSessionExpired, refreshForHttp]);

  const authenticate = useCallback(
    async (credentials) => {
      const session = await login(credentials);
      queryClient.clear();
      setAuthenticated(session);
      return session;
    },
    [queryClient, setAuthenticated],
  );

  const endSession = useCallback(async () => {
    setIsLoggingOut(true);
    let message;

    try {
      await requestLogout();
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        !["NETWORK_ERROR", "REQUEST_TIMEOUT"].includes(error.code)
      ) {
        message = "Não foi possível confirmar o encerramento da sessão.";
      }
    } finally {
      clearSession();
      setIsLoggingOut(false);
      navigate("/login", {
        replace: true,
        state: { from: location, ...(message ? { message } : {}) },
      });
    }
  }, [clearSession, location, navigate]);

  const retryRestore = useCallback(() => {
    setAuth({
      status: "loading",
      user: null,
      expiresIn: 0,
      error: null,
    });
    setRestoreAttempt((attempt) => attempt + 1);
  }, []);

  const value = {
    ...auth,
    login: authenticate,
    logout: endSession,
    isLoggingOut,
    retryRestore,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
