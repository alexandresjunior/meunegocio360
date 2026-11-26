package br.com.meunegocio360.core.fornecedor.api;

import java.util.List;

public record PaginaFornecedorResponse(
    List<FornecedorResponse> content, int page, int size, long totalElements, int totalPages) {}
