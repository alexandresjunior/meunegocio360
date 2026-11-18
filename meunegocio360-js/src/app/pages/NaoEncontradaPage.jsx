import Container from 'react-bootstrap/Container'
import { Link } from 'react-router'
import { Rodape } from '../../shared/ui/Rodape'

export default function NaoEncontradaPage() {
  return (
    <>
      <title>Página não encontrada · MeuNegócio360</title>
      <main className="flex-grow-1 py-5">
        <Container>
          <h1>Página não encontrada</h1>
          <p>O endereço acessado não existe.</p>
          <Link to="/">Ir para a página inicial</Link>
        </Container>
      </main>
      <Rodape />
    </>
  )
}
