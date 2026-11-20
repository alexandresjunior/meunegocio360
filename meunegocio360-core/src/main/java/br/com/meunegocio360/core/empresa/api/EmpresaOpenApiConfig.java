package br.com.meunegocio360.core.empresa.api;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.responses.ApiResponse;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Documenta no OpenAPI o mecanismo {@code EmpresaAtiva} (RF-BE-002): a resposta reutilizável {@code
 * EmpresaNaoAtiva} (422, {@code COMPANY_NOT_ACTIVE}), que os cadastros de RF-BE-003 em diante
 * referenciam com {@code @ApiResponse(responseCode = "422", ref = "EmpresaNaoAtiva")}.
 */
@Configuration
class EmpresaOpenApiConfig {

  static final String RESPOSTA_EMPRESA_NAO_ATIVA = "EmpresaNaoAtiva";

  @Bean
  OpenApiCustomizer respostaEmpresaNaoAtiva() {
    return openApi -> {
      if (openApi.getComponents() == null) {
        openApi.setComponents(new Components());
      }
      ApiResponse resposta =
          new ApiResponse()
              .description(
                  "Não há empresa ativa (RN-04, RNF-096). O empresa_id de toda entidade de negócio"
                      + " é resolvido no servidor a partir da empresa ativa e nunca é aceito do"
                      + " cliente; sem ela, nenhuma entidade de negócio é criada.")
              .content(
                  new Content()
                      .addMediaType(
                          EmpresaController.PROBLEM_JSON,
                          new MediaType()
                              .addExamples(
                                  "COMPANY_NOT_ACTIVE",
                                  new Example().value(ExemplosDeErro.EMPRESA_NAO_ATIVA))));
      openApi.getComponents().addResponses(RESPOSTA_EMPRESA_NAO_ATIVA, resposta);
    };
  }
}
