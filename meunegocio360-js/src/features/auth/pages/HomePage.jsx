import { Button, Card, Container, Spinner } from "react-bootstrap";
import { usePageTitle } from "../../../shared/lib/usePageTitle.js";
import { useAuth } from "../useAuth.js";

export default function HomePage() {
  const { user, logout, isLoggingOut } = useAuth();

  usePageTitle("Início");

  return (
    <main className="app-page d-flex align-items-center justify-content-center p-3">
      <Container className="app-container">
        <Card className="app-card shadow-sm mx-auto">
          <Card.Body className="p-4 p-md-5">
            <h1 className="mb-3">Olá, {user.nome}!</h1>
            <p className="mb-4">
              Perfil: <strong>{user.perfil}</strong>
            </p>
            <Button type="button" onClick={logout} disabled={isLoggingOut}>
              {isLoggingOut ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                    aria-hidden="true"
                  />
                  Saindo...
                </>
              ) : (
                "Sair"
              )}
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
}
