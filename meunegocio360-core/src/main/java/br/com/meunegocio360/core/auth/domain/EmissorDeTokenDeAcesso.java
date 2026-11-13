package br.com.meunegocio360.core.auth.domain;

/** Emite o token de acesso (JWT) de um usuário (RN-05). */
public interface EmissorDeTokenDeAcesso {

  TokenDeAcesso emitir(Usuario usuario);
}
