import { Form } from 'react-bootstrap'

export function ListToolbar({
  query,
  onQueryChange,
  situation,
  onSituationChange,
}) {
  return (
    <div className="row g-3 mb-3">
      <Form.Group className="col-12 col-md-8" controlId="clientes-busca">
        <Form.Label>Buscar por nome ou documento</Form.Label>
        <Form.Control
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          autoComplete="off"
        />
      </Form.Group>
      <Form.Group className="col-12 col-md-4" controlId="clientes-situacao">
        <Form.Label>Situação</Form.Label>
        <Form.Select
          value={situation}
          onChange={(event) => onSituationChange(event.target.value)}
        >
          <option value="ATIVO">Ativos</option>
          <option value="INATIVO">Inativos</option>
          <option value="TODOS">Todos</option>
        </Form.Select>
      </Form.Group>
    </div>
  )
}
