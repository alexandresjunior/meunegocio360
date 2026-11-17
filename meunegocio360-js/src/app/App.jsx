import { lazy, Suspense } from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import { Navigate, Route, Routes, useLocation } from "react-router";
import {
  loadHomePage,
  loadLoginPage,
  useAuth,
} from "../features/auth/index.js";
import { safeInternalPath } from "../shared/lib/safeInternalPath.js";
import "./App.css";

const HomePage = lazy(loadHomePage);
const LoginPage = lazy(loadLoginPage);
const NotFoundPage = lazy(() => import("../shared/pages/NotFoundPage.jsx"));

function LoadingPage() {
  return (
    <main className="app-page d-flex align-items-center justify-content-center">
      <div className="text-center" role="status">
        <Spinner animation="border" aria-hidden="true" />
        <span className="visually-hidden">Carregando...</span>
      </div>
    </main>
  );
}

function RestoreErrorPage() {
  const { retryRestore } = useAuth();

  return (
    <main className="app-page d-flex align-items-center justify-content-center p-3">
      <Card className="app-card shadow-sm">
        <Card.Body className="p-4 p-md-5 text-center">
          <h1 className="mb-3">Não foi possível conectar</h1>
          <p className="mb-4">
            Verifique sua conexão e tente restaurar sua sessão novamente.
          </p>
          <Button type="button" onClick={retryRestore}>
            Tentar novamente
          </Button>
        </Card.Body>
      </Card>
    </main>
  );
}

function PublicOnly({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "authenticated") {
    return <Navigate to={safeInternalPath(location.state?.from)} replace />;
  }

  return children;
}

function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default function App() {
  const { status } = useAuth();

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (status === "unavailable") {
    return <RestoreErrorPage />;
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
