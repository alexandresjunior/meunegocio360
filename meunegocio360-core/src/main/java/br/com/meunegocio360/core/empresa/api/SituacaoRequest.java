package br.com.meunegocio360.core.empresa.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/** Corpo de PATCH /empresa/{id}/situacao. */
public record SituacaoRequest(
    @Schema(example = "false", description = "false inativa; true reativa")
        @NotNull(message = "é obrigatório")
        Boolean ativa,
    @Schema(example = "3", description = "Versão lida na última consulta")
        @NotNull(message = "é obrigatória")
        @PositiveOrZero(message = "deve ser zero ou positiva")
        Long versao) {}
