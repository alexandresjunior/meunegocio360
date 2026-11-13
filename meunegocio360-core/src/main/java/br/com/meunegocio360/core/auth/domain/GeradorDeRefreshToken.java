package br.com.meunegocio360.core.auth.domain;

/** Gera valores de refresh token e calcula o hash que é persistido (RN-06, RN-09). */
public interface GeradorDeRefreshToken {

  /** Novo valor opaco e imprevisível, com pelo menos 256 bits de entropia. */
  String gerar();

  /** Hash SHA-256 em hexadecimal, o único formato gravado no banco. */
  String hash(String valorEmClaro);
}
