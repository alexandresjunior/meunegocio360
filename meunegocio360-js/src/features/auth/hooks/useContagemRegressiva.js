import { useCallback, useEffect, useState } from 'react'

/**
 * Contagem regressiva em segundos, usada no bloqueio temporário da conta
 * (429 + Retry-After, RF-FE-001).
 */
export function useContagemRegressiva() {
  const [fim, setFim] = useState(null)
  const [agora, setAgora] = useState(0)

  useEffect(() => {
    if (fim === null) return undefined
    const id = setInterval(() => {
      const instante = Date.now()
      setAgora(instante)
      if (instante >= fim) setFim(null)
    }, 1000)
    return () => clearInterval(id)
  }, [fim])

  const iniciar = useCallback((segundos) => {
    const instante = Date.now()
    setAgora(instante)
    setFim(instante + segundos * 1000)
  }, [])

  const restantes =
    fim === null ? 0 : Math.max(0, Math.ceil((fim - agora) / 1000))

  return { restantes, iniciar }
}
