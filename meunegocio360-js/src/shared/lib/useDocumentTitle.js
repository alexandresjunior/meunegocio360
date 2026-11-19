import { useEffect } from 'react'

const PRODUTO = 'MeuNegocio360'

/** Define o <title> da página para a rota atual (RNF-FE-24). */
export function useDocumentTitle(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | ${PRODUTO}` : PRODUTO
  }, [titulo])
}
