package br.com.meunegocio360.core.empresa.api;

import br.com.meunegocio360.core.empresa.application.AlterarSituacaoDaEmpresa;
import br.com.meunegocio360.core.empresa.application.AtualizarEmpresa;
import br.com.meunegocio360.core.empresa.application.CadastrarEmpresa;
import br.com.meunegocio360.core.empresa.application.ConsultarEmpresaAtiva;
import br.com.meunegocio360.core.shared.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Empresa da instalação (RF-BE-002). Matriz de autorização (RN-03, RNF-BE-47): qualquer usuário
 * autenticado consulta; somente ADMIN cadastra, edita, inativa e reativa.
 */
@RestController
@RequestMapping("/api/v1/empresa")
@Tag(name = "Empresa", description = "Empresa ativa, parâmetros de exibição e situação")
@SecurityRequirement(name = OpenApiConfig.BEARER)
@ApiResponse(
    responseCode = "401",
    description = "Token de acesso ausente, inválido ou expirado",
    content = @Content(mediaType = EmpresaController.PROBLEM_JSON))
public class EmpresaController {

  static final String PROBLEM_JSON = "application/problem+json";
  private static final String SOMENTE_ADMIN = "hasRole('ADMIN')";
  private static final URI LOCALIZACAO_DA_EMPRESA_ATIVA = URI.create("/api/v1/empresa");

  private final ConsultarEmpresaAtiva consultarEmpresaAtiva;
  private final CadastrarEmpresa cadastrarEmpresa;
  private final AtualizarEmpresa atualizarEmpresa;
  private final AlterarSituacaoDaEmpresa alterarSituacaoDaEmpresa;

  public EmpresaController(
      ConsultarEmpresaAtiva consultarEmpresaAtiva,
      CadastrarEmpresa cadastrarEmpresa,
      AtualizarEmpresa atualizarEmpresa,
      AlterarSituacaoDaEmpresa alterarSituacaoDaEmpresa) {
    this.consultarEmpresaAtiva = consultarEmpresaAtiva;
    this.cadastrarEmpresa = cadastrarEmpresa;
    this.atualizarEmpresa = atualizarEmpresa;
    this.alterarSituacaoDaEmpresa = alterarSituacaoDaEmpresa;
  }

  @GetMapping
  @Operation(
      summary = "Consulta a empresa ativa",
      description = "Disponível para todos os perfis. Sem empresa ativa, responde 404.")
  @ApiResponse(responseCode = "200", description = "Empresa ativa")
  @ApiResponse(
      responseCode = "404",
      description = "Não há empresa ativa: a interface inicia o primeiro cadastro",
      content =
          @Content(
              mediaType = PROBLEM_JSON,
              examples = @ExampleObject(value = ExemplosDeErro.NAO_CADASTRADA)))
  public EmpresaResponse consultar() {
    return EmpresaResponse.de(consultarEmpresaAtiva.executar());
  }

  @PostMapping
  @PreAuthorize(SOMENTE_ADMIN)
  @Operation(
      summary = "Cadastra a empresa (ADMIN)",
      description = "A empresa é criada já ativa. Só pode existir uma empresa ativa.")
  @ApiResponse(
      responseCode = "201",
      description = "Empresa cadastrada",
      headers = @Header(name = HttpHeaders.LOCATION, description = "/api/v1/empresa"))
  @ApiResponse(
      responseCode = "400",
      description = "Dados inválidos",
      content =
          @Content(
              mediaType = PROBLEM_JSON,
              examples = @ExampleObject(value = ExemplosDeErro.CNPJ_INVALIDO)))
  @ApiResponse(
      responseCode = "403",
      description = "Perfil sem permissão",
      content =
          @Content(
              mediaType = PROBLEM_JSON,
              examples = @ExampleObject(value = ExemplosDeErro.ACESSO_NEGADO)))
  @ApiResponse(
      responseCode = "409",
      description = "CNPJ já cadastrado ou empresa ativa já existente",
      content =
          @Content(
              mediaType = PROBLEM_JSON,
              examples = {
                @ExampleObject(name = "CNPJ duplicado", value = ExemplosDeErro.CNPJ_DUPLICADO),
                @ExampleObject(name = "Empresa já ativa", value = ExemplosDeErro.JA_ATIVA)
              }))
  public ResponseEntity<EmpresaResponse> cadastrar(@Valid @RequestBody EmpresaRequest requisicao) {
    EmpresaResponse empresa = EmpresaResponse.de(cadastrarEmpresa.executar(requisicao.paraDados()));
    // A empresa recém-cadastrada é a empresa ativa, consultada em GET /api/v1/empresa.
    return ResponseEntity.created(LOCALIZACAO_DA_EMPRESA_ATIVA).body(empresa);
  }

  @PutMapping("/{id}")
  @PreAuthorize(SOMENTE_ADMIN)
  @Operation(
      summary = "Edita a empresa (ADMIN)",
      description = "Exige a versao lida. O CNPJ pode ser alterado, desde que continue único.")
  @ApiResponse(responseCode = "200", description = "Empresa atualizada")
  @ApiResponse(
      responseCode = "400",
      description = "Dados inválidos",
      content = @Content(mediaType = PROBLEM_JSON))
  @ApiResponse(
      responseCode = "403",
      description = "Perfil sem permissão",
      content = @Content(mediaType = PROBLEM_JSON))
  @ApiResponse(
      responseCode = "404",
      description = "Empresa inexistente",
      content =
          @Content(
              mediaType = PROBLEM_JSON,
              examples = @ExampleObject(value = ExemplosDeErro.NAO_ENCONTRADA)))
  @ApiResponse(
      responseCode = "409",
      description = "Versão desatualizada ou CNPJ já cadastrado",
      content =
          @Content(
              mediaType = PROBLEM_JSON,
              examples = {
                @ExampleObject(name = "Versão desatualizada", value = ExemplosDeErro.VERSAO),
                @ExampleObject(name = "CNPJ duplicado", value = ExemplosDeErro.CNPJ_DUPLICADO)
              }))
  public EmpresaResponse atualizar(
      @PathVariable UUID id, @Valid @RequestBody AtualizarEmpresaRequest requisicao) {
    return EmpresaResponse.de(
        atualizarEmpresa.executar(id, requisicao.paraDados(), requisicao.versao()));
  }

  @PatchMapping("/{id}/situacao")
  @PreAuthorize(SOMENTE_ADMIN)
  @Operation(
      summary = "Inativa ou reativa a empresa (ADMIN)",
      description =
          "A empresa nunca é excluída. Sem empresa ativa, os demais cadastros respondem 422"
              + " COMPANY_NOT_ACTIVE.")
  @ApiResponse(responseCode = "200", description = "Situação alterada")
  @ApiResponse(
      responseCode = "403",
      description = "Perfil sem permissão",
      content = @Content(mediaType = PROBLEM_JSON))
  @ApiResponse(
      responseCode = "404",
      description = "Empresa inexistente",
      content = @Content(mediaType = PROBLEM_JSON))
  @ApiResponse(
      responseCode = "409",
      description = "Versão desatualizada ou outra empresa já ativa",
      content =
          @Content(
              mediaType = PROBLEM_JSON,
              examples = {
                @ExampleObject(name = "Empresa já ativa", value = ExemplosDeErro.JA_ATIVA),
                @ExampleObject(name = "Versão desatualizada", value = ExemplosDeErro.VERSAO)
              }))
  public EmpresaResponse alterarSituacao(
      @PathVariable UUID id, @Valid @RequestBody SituacaoRequest requisicao) {
    return EmpresaResponse.de(
        alterarSituacaoDaEmpresa.executar(id, requisicao.ativa(), requisicao.versao()));
  }
}
