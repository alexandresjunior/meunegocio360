package br.com.meunegocio360.core.auth.api;

import br.com.meunegocio360.core.auth.application.DadosDoUsuario;
import br.com.meunegocio360.core.auth.domain.Perfil;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

/** Usuário autenticado, como exposto na API (sem hash de senha, RNF-BE-02). */
public record UsuarioResponse(
    @Schema(example = "0b6c6a8e-3a1f-4a4b-9a64-2d0f1c3f6b11") UUID id,
    @Schema(example = "Administrador") String nome,
    @Schema(example = "admin@meunegocio360.com.br") String email,
    @Schema(example = "ADMIN") Perfil perfil) {

  static UsuarioResponse de(DadosDoUsuario dados) {
    return new UsuarioResponse(dados.id(), dados.nome(), dados.email(), dados.perfil());
  }

  @Override
  public String toString() {
    return "UsuarioResponse[id=" + id + ", perfil=" + perfil + "]";
  }
}
