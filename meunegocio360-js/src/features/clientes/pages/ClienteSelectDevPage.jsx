import { useEffect, useState } from 'react'
import ClienteSelect from '../components/ClienteSelect.jsx'

function ClienteSelectDevPage() {
  const [cliente, setCliente] = useState(null)

  useEffect(() => {
    document.title = 'Verificação do seletor de clientes | MeuNegocio360'
  }, [])

  return (
    <main className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <h1 className="h2 mb-4">Verificação do seletor de clientes</h1>
          <ClienteSelect
            value={cliente}
            onChange={setCliente}
            label="Buscar cliente ativo"
          />
          {cliente && (
            <p className="mt-3" role="status">
              Cliente selecionado: {cliente.nome} ({cliente.id})
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default ClienteSelectDevPage
