package br.com.meunegocio360.core.auth.application;

import br.com.meunegocio360.core.auth.domain.Usuario;
import br.com.meunegocio360.core.auth.domain.UsuarioRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Caso de uso de {@code GET /auth/me}: dados do usuário dono do token de acesso. */
@Service
public class ConsultarUsuarioAutenticado {

  private final UsuarioRepository usuarios;

  public ConsultarUsuarioAutenticado(UsuarioRepository usuarios) {
    this.usuarios = usuarios;
  }

  @Transactional(readOnly = true)
  public DadosDoUsuario executar(UUID usuarioId) {
    return usuarios
        .findById(usuarioId)
        .filter(Usuario::isAtivo)
        .map(DadosDoUsuario::de)
        .orElseThrow(UsuarioNaoAutenticadoException::new);
  }
}
