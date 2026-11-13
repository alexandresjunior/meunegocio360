package br.com.meunegocio360.core.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.UUID;

/**
 * Registro de um refresh token emitido. Guarda apenas o hash SHA-256 do valor (RN-09) e pertence a
 * uma família, que agrupa a cadeia de rotações de uma sessão (RN-07, RN-08). Não sobrescreve {@code
 * toString()} para nunca exibir o hash.
 */
@Entity
@Table(name = "refresh_token")
public class RefreshToken {

  @Id private UUID id;

  @Column(name = "usuario_id", nullable = false, updatable = false)
  private UUID usuarioId;

  @Column(name = "familia_id", nullable = false, updatable = false)
  private UUID familiaId;

  @Column(name = "token_hash", nullable = false, unique = true, length = 64, updatable = false)
  private String tokenHash;

  @Column(name = "expira_em", nullable = false, updatable = false)
  private Instant expiraEm;

  @Column(name = "revogado_em")
  private Instant revogadoEm;

  @Column(name = "criado_em", nullable = false, updatable = false)
  private Instant criadoEm;

  @Column(name = "atualizado_em", nullable = false)
  private Instant atualizadoEm;

  @Version
  @Column(nullable = false)
  private long versao;

  protected RefreshToken() {}

  /** Primeiro token de uma nova sessão (nova família). */
  public static RefreshToken iniciarFamilia(
      UUID usuarioId, String tokenHash, Instant expiraEm, Instant agora) {
    return emitir(usuarioId, UUID.randomUUID(), tokenHash, expiraEm, agora);
  }

  /** Token seguinte da mesma família, emitido na rotação (RN-07). */
  public RefreshToken rotacionar(String novoTokenHash, Instant novaExpiracao, Instant agora) {
    revogar(agora);
    return emitir(usuarioId, familiaId, novoTokenHash, novaExpiracao, agora);
  }

  private static RefreshToken emitir(
      UUID usuarioId, UUID familiaId, String tokenHash, Instant expiraEm, Instant agora) {
    RefreshToken token = new RefreshToken();
    token.id = UUID.randomUUID();
    token.usuarioId = usuarioId;
    token.familiaId = familiaId;
    token.tokenHash = tokenHash;
    token.expiraEm = expiraEm;
    token.criadoEm = agora;
    token.atualizadoEm = agora;
    return token;
  }

  public void revogar(Instant agora) {
    if (revogadoEm == null) {
      revogadoEm = agora;
      atualizadoEm = agora;
    }
  }

  public boolean estaRevogado() {
    return revogadoEm != null;
  }

  public boolean expirou(Instant agora) {
    return !agora.isBefore(expiraEm);
  }

  public UUID getId() {
    return id;
  }

  public UUID getUsuarioId() {
    return usuarioId;
  }

  public UUID getFamiliaId() {
    return familiaId;
  }

  public Instant getExpiraEm() {
    return expiraEm;
  }
}
