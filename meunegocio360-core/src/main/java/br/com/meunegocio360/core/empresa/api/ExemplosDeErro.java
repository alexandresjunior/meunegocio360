package br.com.meunegocio360.core.empresa.api;

/**
 * Exemplos de problem+json da empresa exibidos no OpenAPI (RNF-030). São constantes de compilação
 * porque são usadas dentro de anotações.
 */
final class ExemplosDeErro {

  private ExemplosDeErro() {}

  private static final String TIPO = "{\"type\":\"https://meunegocio360.com.br/problemas/";
  private static final String TRACE = ",\"traceId\":\"9f1c2e7a-0000-0000-0000-000000000000\"";
  private static final String EMPRESA = "/api/v1/empresa";
  private static final String EMPRESA_POR_ID =
      "/api/v1/empresa/0b1d6a64-6a0e-4c1c-a2f4-5f6a2d1f9a10";

  static final String NAO_CADASTRADA =
      TIPO
          + "empresa-nao-cadastrada\",\"title\":\"Empresa não cadastrada\",\"status\":404,"
          + "\"detail\":\"Não há empresa ativa cadastrada.\",\"instance\":\""
          + EMPRESA
          + "\",\"code\":\"COMPANY_NOT_REGISTERED\""
          + TRACE
          + "}";

  static final String NAO_ENCONTRADA =
      TIPO
          + "empresa-nao-encontrada\",\"title\":\"Empresa não encontrada\",\"status\":404,"
          + "\"detail\":\"A empresa informada não existe.\",\"instance\":\""
          + EMPRESA_POR_ID
          + "\",\"code\":\"COMPANY_NOT_FOUND\""
          + TRACE
          + "}";

  static final String CNPJ_INVALIDO =
      TIPO
          + "validacao\",\"title\":\"Dados inválidos\",\"status\":400,"
          + "\"detail\":\"Um ou mais campos são inválidos.\",\"instance\":\""
          + EMPRESA
          + "\",\"code\":\"VALIDATION_ERROR\""
          + TRACE
          + ",\"errors\":[{\"field\":\"cnpj\","
          + "\"message\":\"deve ser um CNPJ válido, com 14 dígitos e sem máscara\"}]}";

  static final String CNPJ_DUPLICADO =
      TIPO
          + "cnpj-ja-cadastrado\",\"title\":\"CNPJ já cadastrado\",\"status\":409,"
          + "\"detail\":\"Já existe uma empresa com este CNPJ, que pode estar inativa.\","
          + "\"instance\":\""
          + EMPRESA
          + "\",\"code\":\"COMPANY_CNPJ_DUPLICATE\""
          + TRACE
          + "}";

  static final String JA_ATIVA =
      TIPO
          + "empresa-ja-ativa\",\"title\":\"Já existe empresa ativa\",\"status\":409,"
          + "\"detail\":\"Já existe uma empresa ativa. Inative-a antes de cadastrar ou reativar"
          + " outra.\",\"instance\":\""
          + EMPRESA
          + "\",\"code\":\"COMPANY_ALREADY_ACTIVE\""
          + TRACE
          + "}";

  static final String VERSAO =
      TIPO
          + "conflito-de-versao\",\"title\":\"Conflito de versão\",\"status\":409,"
          + "\"detail\":\"O registro foi alterado por outra pessoa. Recarregue os dados e tente"
          + " novamente.\",\"instance\":\""
          + EMPRESA_POR_ID
          + "\",\"code\":\"VERSION_CONFLICT\""
          + TRACE
          + "}";

  static final String ACESSO_NEGADO =
      TIPO
          + "acesso-negado\",\"title\":\"Acesso negado\",\"status\":403,"
          + "\"detail\":\"Você não tem permissão para acessar este recurso.\",\"instance\":\""
          + EMPRESA
          + "\",\"code\":\"ACCESS_DENIED\""
          + TRACE
          + "}";

  static final String EMPRESA_NAO_ATIVA =
      TIPO
          + "empresa-nao-ativa\",\"title\":\"Empresa não ativa\",\"status\":422,"
          + "\"detail\":\"Não há empresa ativa. Cadastre ou reative a empresa antes de"
          + " continuar.\",\"instance\":\"/api/v1/clientes\",\"code\":\"COMPANY_NOT_ACTIVE\""
          + TRACE
          + "}";
}
