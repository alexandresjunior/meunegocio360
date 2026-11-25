import { useEffect, useId, useRef, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { formatDocument } from '../../../shared/lib/companyFormatting.js'
import { useBuscaClientes } from '../hooks/useClientes.js'

function ClienteSelect({
  value = null,
  onChange,
  invalid = false,
  disabled = false,
  label = 'Cliente',
}) {
  const generatedId = useId()
  const inputId = `${generatedId}-input`
  const listboxId = `${generatedId}-listbox`
  const inputRef = useRef(null)
  const selectedId = value?.id || null
  const [queryDraft, setQueryDraft] = useState({
    selectedId,
    text: value?.nome || '',
  })
  const query =
    queryDraft.selectedId === selectedId ? queryDraft.text : value?.nome || ''
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const normalizedQuery = query.trim()
  const searching = expanded && normalizedQuery.length >= 2
  const isDebouncing = searching && normalizedQuery !== debouncedQuery.trim()
  const customersQuery = useBuscaClientes(debouncedQuery, {
    situacao: 'ATIVO',
    page: 0,
    size: 10,
    enabled: searching && !isDebouncing && debouncedQuery.length >= 2,
  })
  const customers = customersQuery.data?.content || []
  const activeCustomer = customers[activeIndex]

  useEffect(() => {
    if (!searching) {
      return undefined
    }

    const timeoutId = window.setTimeout(
      () => setDebouncedQuery(normalizedQuery),
      400,
    )
    return () => window.clearTimeout(timeoutId)
  }, [normalizedQuery, searching])

  const selectCustomer = (customer) => {
    onChange({
      id: customer.id,
      nome: customer.nome,
      documento: customer.documento,
    })
    setQueryDraft({ selectedId: customer.id, text: customer.nome })
    setExpanded(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setExpanded(true)
      setActiveIndex((current) =>
        customers.length === 0
          ? -1
          : current < customers.length - 1
            ? current + 1
            : 0,
      )
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) =>
        customers.length === 0
          ? -1
          : current > 0
            ? current - 1
            : customers.length - 1,
      )
    } else if (event.key === 'Enter' && activeCustomer) {
      event.preventDefault()
      selectCustomer(activeCustomer)
    } else if (event.key === 'Escape') {
      setExpanded(false)
      setActiveIndex(-1)
    }
  }

  const retrySearch = () => {
    inputRef.current?.focus()
    return customersQuery.refetch()
  }

  return (
    <Form.Group
      className="position-relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setExpanded(false)
          setActiveIndex(-1)
        }
      }}
    >
      <Form.Label htmlFor={inputId}>{label}</Form.Label>
      <Form.Control
        id={inputId}
        ref={inputRef}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={searching}
        aria-controls={searching ? listboxId : undefined}
        aria-activedescendant={
          activeCustomer &&
          !isDebouncing &&
          !customersQuery.isPending &&
          !customersQuery.isError
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        aria-haspopup="listbox"
        aria-invalid={invalid}
        autoComplete="off"
        value={query}
        disabled={disabled}
        isInvalid={invalid}
        onFocus={() => setExpanded(true)}
        onChange={(event) => {
          const nextQuery = event.target.value
          setQueryDraft({ selectedId: null, text: nextQuery })
          setExpanded(true)
          setActiveIndex(-1)
          if (value) {
            onChange(null)
          }
        }}
        onKeyDown={handleKeyDown}
      />

      <div className="visually-hidden" role="status" aria-live="polite">
        {isDebouncing || customersQuery.isFetching ? 'Buscando...' : ''}
      </div>

      {searching && (
        <div className="cliente-select-popup position-absolute top-100 start-0 w-100 shadow">
          <div
            id={listboxId}
            className="list-group cliente-select-list"
            role="listbox"
            aria-label="Sugestões de clientes ativos"
          >
            {!isDebouncing &&
              !customersQuery.isPending &&
              !customersQuery.isError &&
              customers.map((customer, index) => (
                <div
                  id={`${listboxId}-option-${index}`}
                  key={customer.id}
                  className={`list-group-item list-group-item-action${
                    activeIndex === index ? ' active' : ''
                  }`}
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectCustomer(customer)}
                >
                  <span className="d-block fw-semibold">{customer.nome}</span>
                  <span className="small">
                    {formatDocument(customer.documento, customer.tipoPessoa)}
                  </span>
                </div>
              ))}
          </div>
          {(isDebouncing || customersQuery.isPending) && (
            <div className="list-group-item">Buscando...</div>
          )}
          {customersQuery.isError && (
            <div className="list-group-item" role="alert">
              Erro ao buscar.
              <Button
                type="button"
                variant="link"
                className="p-0 ms-2"
                onMouseDown={(event) => event.preventDefault()}
                onClick={retrySearch}
              >
                Tentar novamente
              </Button>
            </div>
          )}
          {!isDebouncing &&
            !customersQuery.isPending &&
            !customersQuery.isError &&
            customers.length === 0 && (
              <div className="list-group-item" role="status" aria-live="polite">
                Nenhum cliente encontrado.
              </div>
            )}
        </div>
      )}
    </Form.Group>
  )
}

export default ClienteSelect
