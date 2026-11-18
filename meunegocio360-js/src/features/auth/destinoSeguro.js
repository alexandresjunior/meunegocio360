/**
 * Evita redirecionamento aberto: só caminhos internos, começando com "/" e não com "//" ou "/\".
 */
export function destinoSeguro(destino) {
  if (typeof destino !== 'string' || !destino.startsWith('/')) {
    return '/'
  }
  if (destino.startsWith('//') || destino.startsWith('/\\')) {
    return '/'
  }
  return destino
}
