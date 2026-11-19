package br.com.meunegocio360.core.shared.validation;

/**
 * Validação de documentos fiscais pelos dígitos verificadores (RNF-BE-27). Os documentos trafegam e
 * são armazenados somente com dígitos; a máscara é responsabilidade do frontend.
 */
public final class DocumentoFiscal {

  private static final int TAMANHO_CNPJ = 14;
  private static final int[] PESOS_PRIMEIRO_DIGITO_CNPJ = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
  private static final int[] PESOS_SEGUNDO_DIGITO_CNPJ = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

  private DocumentoFiscal() {}

  /**
   * CNPJ com 14 dígitos, sem sequência repetida (ex.: 00000000000000) e dígitos verificadores ok.
   */
  public static boolean cnpjValido(String cnpj) {
    if (cnpj == null || !cnpj.matches("\\d{" + TAMANHO_CNPJ + "}") || todosIguais(cnpj)) {
      return false;
    }
    int primeiro = digitoVerificador(cnpj, PESOS_PRIMEIRO_DIGITO_CNPJ);
    int segundo = digitoVerificador(cnpj, PESOS_SEGUNDO_DIGITO_CNPJ);
    return primeiro == Character.getNumericValue(cnpj.charAt(12))
        && segundo == Character.getNumericValue(cnpj.charAt(13));
  }

  private static int digitoVerificador(String documento, int[] pesos) {
    int soma = 0;
    for (int i = 0; i < pesos.length; i++) {
      soma += Character.getNumericValue(documento.charAt(i)) * pesos[i];
    }
    int resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  private static boolean todosIguais(String documento) {
    return documento.chars().allMatch(c -> c == documento.charAt(0));
  }
}
