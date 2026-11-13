package br.com.meunegocio360.core.auth.domain;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/** Porta de persistência de refresh tokens; implementada na camada infra (RNF-010). */
public interface RefreshTokenRepository {

  RefreshToken save(RefreshToken token);

  /**
   * Busca pelo hash com bloqueio pessimista da linha: duas renovações simultâneas com o mesmo token
   * são serializadas e apenas uma vence (RN-07).
   */
  Optional<RefreshToken> buscarPorHashParaAtualizacao(String tokenHash);

  /** Revoga todos os tokens ainda ativos de uma família (RN-08, RN-10). */
  int revogarFamilia(UUID familiaId, Instant agora);

  /** Revoga todos os tokens ainda ativos de um usuário (RN-13). */
  int revogarTodosDoUsuario(UUID usuarioId, Instant agora);

  /** Remove tokens expirados ou revogados antes do limite informado. */
  int removerExpiradosOuRevogadosAntesDe(Instant limite);
}
