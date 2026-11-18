import Spinner from 'react-bootstrap/Spinner'

/** Indicador de carregamento acessível (role="status", RNF-062). */
export function Carregando({ mensagem = 'Carregando…' }) {
  return (
    <div
      className="flex-grow-1 d-flex flex-column align-items-center justify-content-center gap-3 py-5"
      role="status"
    >
      <Spinner animation="border" aria-hidden="true" />
      <span>{mensagem}</span>
    </div>
  )
}
