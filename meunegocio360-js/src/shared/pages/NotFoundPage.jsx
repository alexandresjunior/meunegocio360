import { Card } from "react-bootstrap";
import { Link } from "react-router";
import { usePageTitle } from "../lib/usePageTitle.js";

export default function NotFoundPage() {
  usePageTitle("Página não encontrada");

  return (
    <main className="app-page d-flex align-items-center justify-content-center p-3">
      <Card className="app-card shadow-sm">
        <Card.Body className="p-4 p-md-5 text-center">
          <h1 className="mb-3">Página não encontrada</h1>
          <Link className="btn btn-primary" to="/">
            Ir para a página inicial
          </Link>
        </Card.Body>
      </Card>
    </main>
  );
}
