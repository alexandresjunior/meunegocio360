import Spinner from 'react-bootstrap/Spinner'

/** Indicador de carregamento acessível (role="status"), usado na inicialização e no code splitting. */
export default function TelaCarregando({ mensagem = 'Carregando…' }) {
  return (
    <div
      className="d-flex min-vh-100 align-items-center justify-content-center"
      role="status"
    >
      <Spinner animation="border" aria-hidden="true" />
      <span className="visually-hidden">{mensagem}</span>
    </div>
  )
}
