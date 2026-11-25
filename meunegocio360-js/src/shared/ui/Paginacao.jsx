import { Pagination } from 'react-bootstrap'

export function Paginacao({ page, totalPages, onPageChange, label }) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav aria-label={label}>
      <Pagination className="mb-0">
        <Pagination.Prev
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        />
        <Pagination.Item active aria-current="page">
          {page + 1} de {totalPages}
        </Pagination.Item>
        <Pagination.Next
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
        />
      </Pagination>
    </nav>
  )
}
