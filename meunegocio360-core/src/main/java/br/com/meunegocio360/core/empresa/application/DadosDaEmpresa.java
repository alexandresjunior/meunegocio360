package br.com.meunegocio360.core.empresa.application;

import br.com.meunegocio360.core.empresa.domain.Empresa;
import java.time.Instant;
import java.util.UUID;

/** Visão da empresa devolvida pelos casos de uso; a entidade JPA não sai desta camada. */
public record DadosDaEmpresa(
    UUID id,
    String razaoSocial,
    String nomeFantasia,
    String cnpj,
    String email,
    String telefone,
    String fusoHorario,
    String moeda,
    boolean ativa,
    Instant criadoEm,
    Instant atualizadoEm,
    long versao) {

  static DadosDaEmpresa de(Empresa empresa) {
    return new DadosDaEmpresa(
        empresa.getId(),
        empresa.getRazaoSocial(),
        empresa.getNomeFantasia(),
        empresa.getCnpj(),
        empresa.getEmail(),
        empresa.getTelefone(),
        empresa.getFusoHorario(),
        empresa.getMoeda(),
        empresa.isAtiva(),
        empresa.getCriadoEm(),
        empresa.getAtualizadoEm(),
        empresa.getVersao());
  }
}
