package br.com.meunegocio360.core.auth.application;

import br.com.meunegocio360.core.auth.domain.Perfil;
import br.com.meunegocio360.core.auth.domain.Usuario;
import java.util.UUID;

/** Dados públicos do usuário autenticado; nunca contém hash de senha. */
public record DadosDoUsuario(UUID id, String nome, String email, Perfil perfil) {

  static DadosDoUsuario de(Usuario usuario) {
    return new DadosDoUsuario(
        usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil());
  }

  @Override
  public String toString() {
    return "DadosDoUsuario[id=" + id + ", perfil=" + perfil + "]";
  }
}
