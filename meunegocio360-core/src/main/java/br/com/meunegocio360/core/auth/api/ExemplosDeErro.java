package br.com.meunegocio360.core.auth.api;

/** Exemplos de problem+json exibidos no OpenAPI (RNF-030). */
final class ExemplosDeErro {

  private ExemplosDeErro() {}

  static final String VALIDACAO =
      """
      {"type":"https://meunegocio360.com.br/problemas/validacao","title":"Dados inválidos",\
      "status":400,"detail":"Um ou mais campos são inválidos.","instance":"/api/v1/auth/login",\
      "code":"VALIDATION_ERROR","traceId":"9f1c2e7a-0000-0000-0000-000000000000",\
      "errors":[{"field":"email","message":"deve ser um e-mail válido"}]}\
      """;

  static final String CREDENCIAIS_INVALIDAS =
      """
      {"type":"https://meunegocio360.com.br/problemas/credenciais-invalidas",\
      "title":"Credenciais inválidas","status":401,"detail":"E-mail ou senha inválidos.",\
      "instance":"/api/v1/auth/login","code":"INVALID_CREDENTIALS",\
      "traceId":"9f1c2e7a-0000-0000-0000-000000000000"}\
      """;

  static final String CONTA_BLOQUEADA =
      """
      {"type":"https://meunegocio360.com.br/problemas/conta-temporariamente-bloqueada",\
      "title":"Conta temporariamente bloqueada","status":429,\
      "detail":"Muitas tentativas de login. Tente novamente mais tarde.",\
      "instance":"/api/v1/auth/login","code":"ACCOUNT_TEMPORARILY_LOCKED",\
      "traceId":"9f1c2e7a-0000-0000-0000-000000000000"}\
      """;

  static final String REFRESH_INVALIDO =
      """
      {"type":"https://meunegocio360.com.br/problemas/refresh-token-invalido",\
      "title":"Sessão inválida","status":401,\
      "detail":"A sessão expirou ou é inválida. Faça login novamente.",\
      "instance":"/api/v1/auth/refresh","code":"INVALID_REFRESH_TOKEN",\
      "traceId":"9f1c2e7a-0000-0000-0000-000000000000"}\
      """;

  static final String ORIGEM_NAO_PERMITIDA =
      """
      {"type":"https://meunegocio360.com.br/problemas/origem-nao-permitida",\
      "title":"Origem não permitida","status":403,\
      "detail":"A origem da requisição não é permitida.","instance":"/api/v1/auth/refresh",\
      "code":"ORIGIN_NOT_ALLOWED","traceId":"9f1c2e7a-0000-0000-0000-000000000000"}\
      """;

  static final String NAO_AUTENTICADO =
      """
      {"type":"https://meunegocio360.com.br/problemas/nao-autenticado","title":"Não autenticado",\
      "status":401,"detail":"Autenticação necessária ou token de acesso inválido.",\
      "instance":"/api/v1/auth/me","code":"UNAUTHORIZED",\
      "traceId":"9f1c2e7a-0000-0000-0000-000000000000"}\
      """;
}
