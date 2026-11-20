package br.com.meunegocio360.core.auth.domain;

/**
 * Papel do usuário, gravado no token de acesso (claim {@code perfil}). Perfis definidos em
 * RF-BE-002 (RN-07); o antigo USUARIO foi migrado para OPERADOR_COMERCIAL.
 */
public enum Perfil {
  ADMIN,
  OPERADOR_COMERCIAL,
  OPERADOR_FINANCEIRO
}
