package br.com.meunegocio360.core.empresa.api;

import br.com.meunegocio360.core.empresa.application.DadosDaEmpresa;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

/** Empresa como exposta na API (RNF-BE-02). Datas em ISO 8601 UTC (RNF-033). */
public record EmpresaResponse(
    @Schema(example = "0b1d6a64-6a0e-4c1c-a2f4-5f6a2d1f9a10") UUID id,
    @Schema(example = "Comércio Exemplo Ltda") String razaoSocial,
    @Schema(example = "Exemplo Informática") String nomeFantasia,
    @Schema(example = "11222333000181") String cnpj,
    @Schema(example = "contato@exemplo.com.br") String email,
    @Schema(example = "11987654321") String telefone,
    @Schema(example = "America/Sao_Paulo") String fusoHorario,
    @Schema(example = "BRL") String moeda,
    @Schema(example = "true") boolean ativa,
    @Schema(example = "2026-11-18T14:30:00Z") Instant criadoEm,
    @Schema(example = "2026-11-18T14:30:00Z") Instant atualizadoEm,
    @Schema(example = "0") long versao) {

  static EmpresaResponse de(DadosDaEmpresa dados) {
    return new EmpresaResponse(
        dados.id(),
        dados.razaoSocial(),
        dados.nomeFantasia(),
        dados.cnpj(),
        dados.email(),
        dados.telefone(),
        dados.fusoHorario(),
        dados.moeda(),
        dados.ativa(),
        dados.criadoEm(),
        dados.atualizadoEm(),
        dados.versao());
  }
}
