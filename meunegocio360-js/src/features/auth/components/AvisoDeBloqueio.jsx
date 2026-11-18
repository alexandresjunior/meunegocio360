import { useEffect, useState } from 'react'
import Alert from 'react-bootstrap/Alert'

/**
 * Alerta de conta bloqueada (429), com contagem a partir do Retry-After.
 * Avisa o formulário quando a espera termina, para reabilitar o botão.
 */
export function AvisoDeBloqueio({ segundos, aoTerminar }) {
  const [restantes, setRestantes] = useState(segundos)

  useEffect(() => {
    const intervalo = setInterval(() => setRestantes((atual) => Math.max(0, atual - 1)), 1000)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    if (restantes === 0) {
      aoTerminar()
    }
  }, [restantes, aoTerminar])

  const minutos = Math.max(1, Math.ceil(restantes / 60))
  return (
    <Alert variant="danger" className="mb-4">
      Muitas tentativas. Tente novamente em {minutos} {minutos === 1 ? 'minuto' : 'minutos'}.
    </Alert>
  )
}
