package br.com.meunegocio360.core.empresa.domain;

/**
 * Campos editáveis da empresa, já validados e normalizados (trim; opcionais vazios como nulo).
 * {@code fusoHorario} e {@code moeda} nulos assumem os padrões da RN-05.
 */
public record DadosCadastrais(
    String razaoSocial,
    String nomeFantasia,
    String cnpj,
    String email,
    String telefone,
    String fusoHorario,
    String moeda) {}
