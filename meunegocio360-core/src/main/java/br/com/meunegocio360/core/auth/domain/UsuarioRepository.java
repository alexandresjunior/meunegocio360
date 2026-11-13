package br.com.meunegocio360.core.auth.domain;

import java.util.Optional;
import java.util.UUID;

/** Porta de persistência de usuários; implementada na camada infra (RNF-010). */
public interface UsuarioRepository {

  Optional<Usuario> findById(UUID id);

  boolean existsByEmail(String email);

  /**
   * Busca por e-mail (já normalizado) com bloqueio pessimista da linha, para que tentativas
   * simultâneas não percam incrementos do contador de falhas (RN-04).
   */
  Optional<Usuario> buscarPorEmailParaAtualizacao(String email);

  Usuario save(Usuario usuario);
}
