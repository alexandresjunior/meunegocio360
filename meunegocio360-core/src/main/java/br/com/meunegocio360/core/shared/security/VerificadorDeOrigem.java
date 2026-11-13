package br.com.meunegocio360.core.shared.security;

import org.springframework.stereotype.Component;

/**
 * Protege os endpoints que usam cookie contra CSRF: rejeita requisições cujo cabeçalho Origin
 * esteja presente e fora da lista permitida (RNF-BE-40).
 */
@Component
public class VerificadorDeOrigem {

  private final CorsProperties cors;

  public VerificadorDeOrigem(CorsProperties cors) {
    this.cors = cors;
  }

  public void verificar(String origem) {
    if (origem != null && !cors.permite(origem)) {
      throw new OrigemNaoPermitidaException();
    }
  }
}
