/**
 * Devolve o caminho de redirecionamento somente se for interno (começa com "/"
 * e não com "//" nem "/\"), evitando redirecionamento aberto (RF-FE-001,
 * pontos de atenção). Caso contrário, devolve o caminho padrão.
 */
export function caminhoSeguro(caminho, padrao = '/') {
  if (
    typeof caminho !== 'string' ||
    !caminho.startsWith('/') ||
    caminho.startsWith('//') ||
    caminho.startsWith('/\\') ||
    caminho.startsWith('/login')
  ) {
    return padrao
  }
  return caminho
}
